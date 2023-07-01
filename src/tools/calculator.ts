import { Parser } from "expr-eval";

type CustomTool = {
	name: string;
	description: string;
	parameters: {
		type: string;
		properties: {
			[key: string]: {
				type: string;
				description: string;
			};
		};
		required: string[];
	};
};

export class Calculator implements CustomTool {
	name = "calculator";
	description = `Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.`;
	parameters = {
		type: "object",
		properties: {
			input: {
				type: "string",
				description: "The math expression to evaluate",
			},
		},
		required: ["input"],
	};

	call(input: string) {
		try {
			return Parser.evaluate(input).toString();
		} catch (error) {
			return "I don't know how to do that.";
		}
	}
}
