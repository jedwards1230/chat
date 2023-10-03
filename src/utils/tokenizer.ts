import GPT4Tokenizer from 'gpt4-tokenizer';

const tokenizer = new GPT4Tokenizer({ type: 'gpt3' });

export function getTokenCount(input: string) {
    return tokenizer.estimateTokenCount(input);
}
