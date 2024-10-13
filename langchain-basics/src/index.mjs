import { DynamoDBChatMessageHistory } from "@langchain/community/stores/message/dynamodb";
import {AIMessageChunk, HumanMessage, SystemMessage} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import {ChatOpenAI} from "@langchain/openai";

import dotenv from 'dotenv';
import readline from 'readline-sync'


dotenv.config();

async function simpleModelChat() {

  const model = new ChatOpenAI({ model: "gpt-4" });

  await model.invoke([{ role: "user", content: "Hi! I'm Bob" }]);
  await model.invoke([{ role: "user", content: "What's my name?" }]);

}

// Simple model chat with output parser.
async function simpleModelChatWithParser() {

  const model = new ChatOpenAI({ model: "gpt-4" });

  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
  ];

  const parser = new StringOutputParser();
  const result = await model.invoke(messages);

  await parser.invoke(result);

}

// Chain of model and parser with a pipeline.
// Only 1 invoke is needed here instead of 2 invokes in the previous example.
async function simpleModelChain() {

  const model = new ChatOpenAI({ model: "gpt-4" });
  const parser = new StringOutputParser();
  const chain = model.pipe(parser);

  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
  ];

  await chain.invoke(messages);

}

// Chain of model, prompt, and parser with a pipeline.
async function simpleModelChainWithPrompt() {
  const model = new ChatOpenAI({ model: "gpt-4" });
  const parser = new StringOutputParser();

  const systemTemplate = "Translate the following into {language}:";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const llmChain = promptTemplate.pipe(model).pipe(parser);
  await llmChain.invoke({ language: "Dutch", text: "Great to finally meet you" });
}

// Chain of model, prompt, parser, and memory with a pipeline.
async function chatHistoryWithDynamoDB() {
  const memory = new BufferMemory({
    chatHistory: new DynamoDBChatMessageHistory({
      tableName: "langchain",
      partitionKey: "PK",
      sortKey: "SK",
      sessionId: new Date().toISOString(), // Or some other unique identifier for the conversation
    })});

    const model = new ChatOpenAI({ model: "gpt-4" });

    const chain = new ConversationChain({ llm: model, memory });

    await chain.invoke({ input: "Hi! I'm Jim." });
    await chain.invoke({ input: "What did I just say my name was?" });

}

main().catch(console.error);

async function main() {

  const functionsMap = {
    '1. simpleModelChat': simpleModelChat,
    '2. simpleModelChatWithParser': simpleModelChatWithParser,
    '3. simpleModelChain': simpleModelChain,
    '4. simpleModelChainWithPrompt': simpleModelChainWithPrompt,
    '5. chatHistoryWithDynamoDB: ': chatHistoryWithDynamoDB
  };

  function displayFunctions() {
    console.log("Available functions:");
    for (const fnName in functionsMap) {
      console.log(fnName);
    }
  }


  displayFunctions();

  const choice = readline.question('Select a function number: ');

  // Execute the corresponding function if the choice is valid
  const selectedFunction = Object.keys(functionsMap).find(key => key.startsWith(choice));

  if (selectedFunction) {
    await functionsMap[selectedFunction]();
  } else {
    console.log("Invalid choice. Please try again.");
  }

}


