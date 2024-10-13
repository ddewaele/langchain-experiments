import {createOpenAI} from '@ai-sdk/openai';
import {convertToCoreMessages, streamText} from "ai";

const openai = createOpenAI({
    compatibility: 'strict', // strict mode, enable when using the OpenAI API
});

const model = openai('gpt-4-turbo');


export async function POST(req: Request) {

    const { messages } = await req.json();

    const result = await streamText({
        model: openai('gpt-4-turbo'),
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();


}