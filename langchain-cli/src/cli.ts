import * as readline from 'readline';
import { LangChain, OpenAIStreamOutput } from 'langchain';
import dotenv from 'dotenv';
import {ChatOpenAI} from "@langchain/openai";
import {StringOutputParser} from "@langchain/core/output_parsers";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {AIMessageChunk} from "@langchain/core/messages";

dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0.8,
});

const outputParser = new StringOutputParser();
const prompt = ChatPromptTemplate.fromTemplate(
    `Answer the following question to the best of your ability:\n{question}`
);

const chain = prompt.pipe(model).pipe(outputParser);

// Initialize readline interface for CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function handleStreamOutput(stream: any) {

  let gathered: AIMessageChunk | undefined = undefined;

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
    // console.log(JSON.stringify(chunk));

    if (gathered === undefined) {
      gathered = chunk;
    } else {
      gathered = gathered += chunk
    }
  }

}

// Function to prompt user for input
// https://js.langchain.com/docs/how_to/streaming/
async function askForPrompt() {
  rl.question('Enter your prompt: ', async (userPrompt: string) => {
    if (userPrompt.toLowerCase() === 'exit') {
      rl.close();
    } else {

      const stream = await model.stream(userPrompt);

      try {
        console.log("Processing...");
        await handleStreamOutput(stream);
      } catch (error) {
        console.error("Error generating response:", error);
        await askForPrompt();  // Allow retry if an error occurs
      }
    }
  });
}

main().catch(console.error);

async function main() {
  await askForPrompt();
}



