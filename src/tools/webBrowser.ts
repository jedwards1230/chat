import * as cheerio from "cheerio";
import { BaseLanguageModel } from "langchain/dist/base_language";
import {
	CallbackManager,
	CallbackManagerForToolRun,
} from "langchain/dist/callbacks/manager";
import { Embeddings } from "langchain/embeddings";
import {
	TextSplitter,
	RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { Document } from "langchain/document";
import { ToolParams, Tool } from "langchain/tools";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export const parseInputs = (inputs: string): [string, string] => {
	const [baseUrl, task] = inputs.split(",").map((input) => {
		let t = input.trim();
		t = t.startsWith('"') ? t.slice(1) : t;
		t = t.endsWith('"') ? t.slice(0, -1) : t;
		// it likes to put / at the end of urls, wont matter for task
		t = t.endsWith("/") ? t.slice(0, -1) : t;
		return t.trim();
	});

	return [baseUrl, task];
};

export const getText = (
	html: string,
	baseUrl: string,
	summary: boolean
): string => {
	// scriptingEnabled so noscript elements are parsed
	const $ = cheerio.load(html, { scriptingEnabled: true });

	let text = "";

	// lets only get the body if its a summary, dont need to summarize header or footer etc
	const rootElement = summary ? "body " : "*";

	$(`${rootElement}:not(style):not(script):not(svg)`).each(
		(_i, elem: any) => {
			// we dont want duplicated content as we drill down so remove children
			let content = $(elem)
				.clone()
				.children()
				.remove()
				.end()
				.text()
				.trim();
			const $el = $(elem);

			// if its an ahref, print the content and url
			let href = $el.attr("href");
			if ($el.prop("tagName")?.toLowerCase() === "a" && href) {
				if (!href.startsWith("http")) {
					try {
						href = new URL(href, baseUrl).toString();
					} catch {
						// if this fails thats fine, just no url for this
						href = "";
					}
				}

				const imgAlt = $el.find("img[alt]").attr("alt")?.trim();
				if (imgAlt) {
					content += ` ${imgAlt}`;
				}

				text += ` [${content}](${href})`;
			}
			// otherwise just print the content
			else if (content !== "") {
				text += ` ${content}`;
			}
		}
	);

	return text.trim().replace(/\n+/g, " ");
};

const getHtml = async (baseUrl: string, headers: Headers) => {
	let url;
	try {
		url = new URL(baseUrl);
	} catch {
		throw new Error("Invalid URL");
	}

	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.text();
};

const DEFAULT_HEADERS = {
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
	"Accept-Encoding": "gzip, deflate",
	"Accept-Language": "en-US,en;q=0.5",
	Connection: "keep-alive",
	Referer: "https://www.google.com/",
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "cross-site",
	"Upgrade-Insecure-Requests": "1",
	"User-Agent":
		"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
};

type Headers = Record<string, any>;

export interface WebBrowserArgs extends ToolParams {
	model: BaseLanguageModel;

	embeddings: Embeddings;

	headers?: Headers;

	/** @deprecated */
	callbackManager?: CallbackManager;

	textSplitter?: TextSplitter;
}

export class WebBrowser extends Tool {
	get lc_namespace() {
		return [...super.lc_namespace, "webbrowser"];
	}

	private model: BaseLanguageModel;

	private embeddings: Embeddings;

	private headers: Headers;

	private textSplitter: TextSplitter;

	constructor({ model, headers, embeddings, textSplitter }: WebBrowserArgs) {
		super(...arguments);

		this.model = model;
		this.embeddings = embeddings;
		this.headers = headers ?? DEFAULT_HEADERS;
		this.textSplitter =
			textSplitter ??
			new RecursiveCharacterTextSplitter({
				chunkSize: 2000,
				chunkOverlap: 200,
			});
	}

	/** @ignore */
	async _call(inputs: string, runManager?: CallbackManagerForToolRun) {
		const [baseUrl, task] = parseInputs(inputs);
		const doSummary = !task;

		let text;
		try {
			const html = await getHtml(baseUrl, this.headers);
			text = getText(html, baseUrl, doSummary);
		} catch (e) {
			if (e) {
				return e.toString();
			}
			return "There was a problem connecting to the site";
		}

		const texts = await this.textSplitter.splitText(text);

		let context;
		// if we want a summary grab first 4
		if (doSummary) {
			context = texts.slice(0, 4).join("\n");
		}
		// search term well embed and grab top 4
		else {
			const docs = texts.map(
				(pageContent) =>
					new Document({
						pageContent,
						metadata: [],
					})
			);

			const vectorStore = await MemoryVectorStore.fromDocuments(
				docs,
				this.embeddings
			);
			const results = await vectorStore.similaritySearch(task, 4);
			context = results.map((res) => res.pageContent).join("\n");
		}

		const input = `Text:${context}\n\nI need ${
			doSummary ? "a summary" : task
		} from the above text, also provide up to 5 markdown links from within that would be of interest (always including URL and text). Links should be provided, if present, in markdown syntax as a list under the heading "Relevant Links:".`;

		return this.model.predict(input, undefined, runManager?.getChild());
	}

	name = "web-browser";

	description = `useful for when you need to find something on or summarize a webpage. input should be a comma separated list of "ONE valid http URL including protocol","what you want to find on the page or empty string for a summary".`;

	parameters = {
		type: "object",
		properties: {
			input: {
				type: "string",
				description: this.description,
			},
		},
		required: ["input"],
	};
}
