import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage } from '@langchain/core/messages';

// Initialize Genkit with Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// Define the function that generates menu items
async function generateMenuContent(state: typeof MessagesAnnotation.State) {
  // Get the input message from the state
  const input = state.messages[state.messages.length - 1].content;
  
  const { text } = await ai.generate(
    `Create a creative fusion menu item that combines pirate cuisine with ${input} cuisine. Include a fun pirate-themed name, description of the fusion dish, and price.`
  );
  // Convert the response to match LangGraph's expected format
  return { messages: [{ content: text, type: 'ai' }] };
}

// Create the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("generator", generateMenuContent)
  .addEdge("__start__", "generator")
  .addEdge("generator", "__end__");

// Compile the graph
const app = workflow.compile();

// Invoke the app
const result = await app.invoke({
  messages: [new HumanMessage("Caribbean")] // Initial empty state
});

// Log the generated menu item
console.log(result.messages[result.messages.length - 1].content);