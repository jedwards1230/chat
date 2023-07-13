type Tool = "calculator" | "search" | "web-browser";

type CustomTool = {
	name: string;
	description: string;
	parameters: {
		type: string;
		required: string[];
		properties: {
			[key: string]: {
				description: string;
				type: string;
			};
		};
	};
};
