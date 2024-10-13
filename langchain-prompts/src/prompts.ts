import * as readline from 'readline';
import { LangChain, OpenAIStreamOutput } from 'langchain';
import dotenv from 'dotenv';
import {ChatOpenAI} from "@langchain/openai";
import {JsonOutputParser, StringOutputParser} from "@langchain/core/output_parsers";
import {ChatPromptTemplate, PromptTemplate, StructuredPrompt} from "@langchain/core/prompts";
import {AIMessageChunk} from "@langchain/core/messages";
import { z } from "zod";
import {StructuredOutputParser} from "langchain/output_parsers";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.8,
});

async function promptInvoke() {
    const msg: AIMessageChunk = await model.invoke([{role: "user", content: "Hi! I'm Bob"}]);
    console.log("Found ", msg.content);
}

async function promptStream() {
    const stream = await model.stream("Hi! I'm Bob");

    for await (const chunk of stream) {
        console.log(JSON.stringify(chunk));
    }

}

async function promptChain() {
    const prompt = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const msg: string = await chain.invoke({ topic: "bears" });
    console.log("Found ", msg);
}

// https://js.langchain.com/docs/how_to/structured_output/
async function promptStructuredWithStructuredOutput() {

    const joke = z.object({
        setup: z.string().describe("The setup of the joke"),
        punchline: z.string().describe("The punchline to the joke"),
        rating: z.number().optional().describe("How funny the joke is, from 1 to 10"),
    });

    const structuredLlm = model.withStructuredOutput(joke);

    const msg = await structuredLlm.invoke("Tell me a joke about cats");
    console.log(msg)

}

async function promptStructureOutputWithFormatInstructions() {
    const zodSchema = z.object({
        answer: z.string().describe("answer to the user's question"),
        source: z
            .string()
            .describe(
                "source used to answer the user's question, should be a website."
            ),
    });

    const parser = StructuredOutputParser.fromZodSchema(zodSchema);

    const prompt = ChatPromptTemplate.fromTemplate(
        "Answer the users question as best as possible.\n{format_instructions}\n{question}"
    )
    const chain = prompt.pipe(model)

    console.log(parser.getFormatInstructions());

    const response = await chain.invoke({
        question: "What is the capital of France?",
        format_instructions: parser.getFormatInstructions(),
    });

    console.log(response.content);
}

async function promptStructureOutputWithFormatInstructions2() {

    const joke = z.object({
        setup: z.string().describe("The setup of the joke"),
        punchline: z.string().describe("The punchline to the joke"),
        rating: z.number().optional().describe("How funny the joke is, from 1 to 10"),
    });

    const parser = StructuredOutputParser.fromZodSchema(joke);

    console.log("Instructions = ",parser.getFormatInstructions())

    const template = new PromptTemplate({
        template: `tell me a joke about {topic}. \\n{format_instructions}`,
        inputVariables: ["topic","format_instructions"],
        // partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const response = await
        template
            .pipe(model)
            .invoke({
                topic: "bears",
                format_instructions: parser.getFormatInstructions(),
            })

    console.log(response.content);

}

// https://js.langchain.com/docs/how_to/output_parser_json/
export async function promptWithJsonOutputParser() {

    // Define your desired data structure. Only used for typing the parser output.
    interface Joke {
        setup: string;
        punchline: string;
    }

    // A query and format instructions used to prompt a language model.
    const jokeQuery = "Tell me a joke.";
    const formatInstructions =
        "Respond with a valid JSON object, containing two fields: 'setup' and 'punchline'.";

    // Set up a parser + inject instructions into the prompt template.
    const parser = new JsonOutputParser<Joke>();

    const prompt = ChatPromptTemplate.fromTemplate(
        "Answer the user query.\n{format_instructions}\n{query}\n"
    );

    const partialedPrompt = await prompt.partial({
        format_instructions: formatInstructions,
    });

    const chain = partialedPrompt.pipe(model).pipe(parser);

    const msg = await chain.invoke({ query: jokeQuery });

    console.log(msg);
}


main().catch(console.error);

async function main() {
    // await promptInvoke();
    // await promptStream();
    // await promptChain();
    await promptWithJsonOutputParser()
}




