export interface MessageHistory {
  role: "user" | "model";
  content: string;
}

export interface ToolCallResult {
  name: string;
  args: any;
  result: any;
}

export interface AIService {
  generateStream(
    systemInstruction: string,
    message: string,
    history: MessageHistory[]
  ): Promise<ReadableStream<string>>;

  generateWithTools(
    systemInstruction: string,
    message: string,
    history: MessageHistory[],
    tenantId: string,
    userId: string
  ): Promise<{
    text: string;
    reasoning: string;
    toolCalls: ToolCallResult[];
  }>;
}
