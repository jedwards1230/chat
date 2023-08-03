import { Parser } from 'expr-eval';

export class Calculator implements CustomTool {
    name: Tool = 'calculator';
    description = `Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.`;
    parameters = {
        type: 'object',
        properties: {
            input: {
                type: 'string',
                description: 'The math expression to evaluate',
            },
        },
        required: ['input'],
    };

    call(input: string) {
        try {
            return Parser.evaluate(input).toString();
        } catch (error) {
            return "I don't know how to do that.";
        }
    }
}
