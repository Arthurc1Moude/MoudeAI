
'use server';

/**
 * @fileOverview A chat response AI agent.
 *
 * - generateChatResponse - A function that handles the chat response process.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  query: z.string().describe('The user query for the AI.'),
  module: z
    .enum([
      'Geniea 1 Pro',
      'Geniea 1 Flash',
      'Geniea Nano 1o',
      'Geniea Super 13o',
      'Imagine 1 SUNO',
      'Imagine 1 Pro',
      'Deep Think',
      'PlayBox',
    ])
    .describe('The specific AI module to use for generating the response.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe("The history of the conversation so far."),
  files: z.array(z.object({ name: z.string(), content: z.string() })).optional().describe("A list of text-based files uploaded by the user."),
  images: z.array(z.object({ name: z.string(), content: z.string() })).optional().describe("A list of images uploaded by the user as data URIs."),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(
  input: GenerateChatResponseInput
): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const promptTemplates = {
  default: `You are an AI assistant from Moude AI. The user is interacting with the {{module}} module.
  
  Here is the conversation history:
  {{#each history}}
  {{this.role}}: {{this.content}}
  {{/each}}
  
  {{#if files}}
  The user has uploaded the following files:
  {{#each files}}
  - {{this.name}}:
  \`\`\`
  {{this.content}}
  \`\`\`
  {{/each}}
  {{/if}}

  {{#if images}}
  The user has uploaded the following image(s). Refer to them when responding.
  {{#each images}}
  Image: {{media url=this.content}}
  {{/each}}
  {{/if}}

  Respond to the following query:
  user: {{query}}`,

  'Deep Think': `You are an AI assistant in "Deep Thinking" mode. Provide a comprehensive, well-reasoned, and in-depth response. Analyze the query from multiple perspectives and provide detailed explanations.

  Here is the conversation history:
  {{#each history}}
  {{this.role}}: {{this.content}}
  {{/each}}
  
  {{#if files}}
  The user has uploaded the following files for your deep analysis:
  {{#each files}}
  - {{this.name}}:
  \`\`\`
  {{this.content}}
  \`\`\`
  {{/each}}
  {{/if}}

  {{#if images}}
  The user has uploaded the following image(s) for your deep analysis.
  {{#each images}}
  Image: {{media url=this.content}}
  {{/each}}
  {{/if}}

  Provide a deep and thoughtful response to the following query:
  user: {{query}}`,

  'PlayBox': `You are a creative partner in "PlayBox" mode. Your goal is to engage in collaborative storytelling and role-playing with the user. Be imaginative, descriptive, and build upon the user's ideas. You can invent characters, settings, and plot twists.
  
  Here is our story so far:
  {{#each history}}
  {{this.role}}: {{this.content}}
  {{/each}}
  
  {{#if files}}
  The user has provided the following files as inspiration or context for our story:
  {{#each files}}
  - {{this.name}}:
  \`\`\`
  {{this.content}}
  \`\`\`
  {{/each}}
  {{/if}}

  {{#if images}}
  The user has provided the following image(s) as inspiration for our story.
  {{#each images}}
  Image: {{media url=this.content}}
  {{/each}}
  {{/if}}
  
  Continue the story based on the user's latest input:
  user: {{query}}`
};

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async (input) => {
  const promptTemplate = promptTemplates[input.module as keyof typeof promptTemplates] || promptTemplates.default;

    const prompt = ai.definePrompt({
      name: 'generateChatResponseDynamicPrompt',
      input: { schema: GenerateChatResponseInputSchema },
      output: { schema: GenerateChatResponseOutputSchema },
      prompt: promptTemplate,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);
