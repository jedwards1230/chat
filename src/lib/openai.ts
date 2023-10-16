import OpenAI from 'openai';

const SERVER_KEY = process.env.OPENAI_API_KEY;

export const openai = new OpenAI({
    apiKey: SERVER_KEY,
});
