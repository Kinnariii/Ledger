import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIService, MessageHistory, ToolCallResult } from "./provider";
import { executeTool, GEMINI_TOOLS_DECLARATION } from "./tools";

export class GeminiService implements AIService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  // Simple streaming generation without tools (used for direct answers)
  async generateStream(
    systemInstruction: string,
    message: string,
    history: MessageHistory[]
  ): Promise<ReadableStream<string>> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessageStream(message);

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(chunkText);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  }

  // Tool-calling generation loop
  async generateWithTools(
    systemInstruction: string,
    message: string,
    history: MessageHistory[],
    tenantId: string,
    userId: string
  ): Promise<{
    text: string;
    reasoning: string;
    toolCalls: ToolCallResult[];
  }> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemInstruction + `\nCRITICAL: You MUST prepend your response with a short explainability reasoning paragraph wrapped in <reasoning>...</reasoning> tags. Inside these tags, briefly explain what data you searched, which tools you called, or why you took these actions. Example:\n<reasoning>I searched for contact 'Rahul' using search_contacts, drafted a follow-up WhatsApp message using send_whatsapp, and scheduled a reminder task using create_task.</reasoning>\nFollow this with your actual user-facing message.`,
      tools: GEMINI_TOOLS_DECLARATION as any,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    let currentMessage: any = message;
    let toolCallsExecuted: ToolCallResult[] = [];
    let responseText = "";
    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      console.log(`Gemini chat turn ${loopCount + 1}...`);
      const response = await chat.sendMessage(currentMessage);
      const functionCalls = response.response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        // No more tool calls, we have the final answer!
        responseText = response.response.text();
        break;
      }

      console.log(`Gemini requested ${functionCalls.length} function calls`);

      // Execute all tool calls in parallel
      const results = await Promise.all(
        functionCalls.map(async (call) => {
          try {
            const result = await executeTool(tenantId, call.name, call.args);
            toolCallsExecuted.push({
              name: call.name,
              args: call.args,
              result,
            });
            return {
              functionResponse: {
                name: call.name,
                response: { result },
              },
            };
          } catch (err: any) {
            console.error(`Error executing tool ${call.name}:`, err);
            return {
              functionResponse: {
                name: call.name,
                response: { error: err.message },
              },
            };
          }
        })
      );

      // Feed the function responses back to the chat model
      currentMessage = results;
      loopCount++;
    }

    if (loopCount >= maxLoops) {
      console.warn("Exceeded max tool calling loop count in Gemini service.");
    }

    // Extract reasoning block from response
    let reasoning = "";
    let text = responseText;

    const reasoningRegex = /<reasoning>([\s\S]*?)<\/reasoning>/i;
    const match = responseText.match(reasoningRegex);

    if (match) {
      reasoning = match[1].trim();
      text = responseText.replace(reasoningRegex, "").trim();
    } else {
      // If the LLM forgot the reasoning tag, build a fallback based on executed tools
      if (toolCallsExecuted.length > 0) {
        reasoning = `Executed tools: ${toolCallsExecuted.map((t) => `${t.name}(${JSON.stringify(t.args)})`).join(", ")}`;
      } else {
        reasoning = "Formulated response directly from system instructions.";
      }
    }

    return {
      text,
      reasoning,
      toolCalls: toolCallsExecuted,
    };
  }

  // Tool-calling streaming generation loop
  async *generateWithToolsStream(
    systemInstruction: string,
    message: string,
    history: MessageHistory[],
    tenantId: string,
    userId: string
  ): AsyncGenerator<
    | { type: "reasoning"; content: string }
    | { type: "tool_calls"; content: ToolCallResult[] }
    | { type: "chunk"; content: string }
    | { type: "done"; text: string; reasoning: string; toolCalls: ToolCallResult[] }
  > {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemInstruction + `\nCRITICAL: You MUST prepend your response with a short explainability reasoning paragraph wrapped in <reasoning>...</reasoning> tags. Inside these tags, briefly explain what data you searched, which tools you called, or why you took these actions. Example:\n<reasoning>I searched for contact 'Rahul' using search_contacts, drafted a follow-up WhatsApp message using send_whatsapp, and scheduled a reminder task using create_task.</reasoning>\nFollow this with your actual user-facing message.`,
      tools: GEMINI_TOOLS_DECLARATION as any,
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    let currentMessage: any = message;
    let toolCallsExecuted: ToolCallResult[] = [];
    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      console.log(`Gemini chat stream turn ${loopCount + 1}...`);
      const result = await chat.sendMessageStream(currentMessage);
      
      let isFunctionCall = false;
      let firstChunkResolved = false;
      let buffer = "";
      let sentReasoning = false;
      let parsedReasoning = "";
      let fullTextResponse = "";

      for await (const chunk of result.stream) {
        if (!firstChunkResolved) {
          const calls = chunk.functionCalls();
          if (calls && calls.length > 0) {
            isFunctionCall = true;
          }
          firstChunkResolved = true;
        }

        if (isFunctionCall) {
          continue;
        }

        const chunkText = chunk.text();
        fullTextResponse += chunkText;
        buffer += chunkText;

        if (!sentReasoning) {
          const closeIndex = buffer.indexOf("</reasoning>");
          if (closeIndex !== -1) {
            const openIndex = buffer.indexOf("<reasoning>");
            const start = openIndex !== -1 ? openIndex + 11 : 0;
            parsedReasoning = buffer.substring(start, closeIndex).trim();
            
            yield { type: "reasoning", content: parsedReasoning };
            sentReasoning = true;

            const remainingText = buffer.substring(closeIndex + 12).trimStart();
            if (remainingText) {
              yield { type: "chunk", content: remainingText };
            }
          } else if (buffer.length > 300 && !buffer.includes("<reasoning>")) {
            yield { type: "chunk", content: buffer };
            sentReasoning = true;
            buffer = "";
          }
        } else {
          yield { type: "chunk", content: chunkText };
        }
      }

      const response = await result.response;
      const candidateParts = response.candidates?.[0]?.content?.parts || [];

      // Manually push input turn into chat._history since SDK stream has history update bugs
      if (loopCount === 0) {
        chat._history.push({
          role: "user",
          parts: [{ text: currentMessage }],
        });
      } else {
        chat._history.push({
          role: "user",
          parts: currentMessage.map((r: any) => r.functionResponse),
        });
      }

      // Manually push output turn into chat._history
      chat._history.push({
        role: "model",
        parts: candidateParts,
      });

      if (isFunctionCall) {
        const functionCalls = response.functionCalls();
        console.log(`Gemini requested ${functionCalls.length} function calls in stream`);
        
        const toolCallsForSse = functionCalls.map((c) => ({
          name: c.name,
          args: c.args,
        }));
        yield { type: "tool_calls", content: toolCallsForSse as any };

        const results = await Promise.all(
          functionCalls.map(async (call) => {
            try {
              const res = await executeTool(tenantId, call.name, call.args);
              toolCallsExecuted.push({
                name: call.name,
                args: call.args,
                result: res,
              });
              return {
                functionResponse: {
                  name: call.name,
                  response: { result: res },
                },
              };
            } catch (err: any) {
              console.error(`Error executing tool ${call.name} in stream:`, err);
              return {
                functionResponse: {
                  name: call.name,
                  response: { error: err.message },
                },
              };
            }
          })
        );

        currentMessage = results;
        loopCount++;
      } else {
        if (!sentReasoning) {
          if (toolCallsExecuted.length > 0) {
            parsedReasoning = `Executed tools: ${toolCallsExecuted.map((t) => `${t.name}(${JSON.stringify(t.args)})`).join(", ")}`;
          } else {
            parsedReasoning = "Formulated response directly from system instructions.";
          }
          yield { type: "reasoning", content: parsedReasoning };
          yield { type: "chunk", content: fullTextResponse };
        }

        const finalText = fullTextResponse.replace(/<reasoning>[\s\S]*?<\/reasoning>/i, "").trim();

        yield {
          type: "done",
          text: finalText,
          reasoning: parsedReasoning,
          toolCalls: toolCallsExecuted,
        };
        return;
      }
    }

    if (loopCount >= maxLoops) {
      console.warn("Exceeded max tool calling loop count in Gemini stream.");
    }
  }
}

// Singleton helper
let serviceInstance: GeminiService | null = null;
export function getAiService(): GeminiService {
  if (!serviceInstance) {
    serviceInstance = new GeminiService();
  }
  return serviceInstance;
}
