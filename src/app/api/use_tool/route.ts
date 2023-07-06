import { Calculator } from "@/tools/calculator";
import { Search } from "@/tools/search";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
	const res = await request.json();
	const {
		tool,
		input,
	}: {
		tool: Tool;
		input: string;
	} = res;

	if (!tool) {
		return new Response("No tool", {
			status: 400,
		});
	}

	if (!input) {
		return new Response("No input", {
			status: 400,
		});
	}

	let result = "";
	switch (tool) {
		case "calculator":
			result = new Calculator().call(input);
			break;
		case "search":
			result = await new Search().call(input);
			break;
		default:
			return new Response("Invalid tool", {
				status: 400,
			});
	}

	return NextResponse.json(result);
}
