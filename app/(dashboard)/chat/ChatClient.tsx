"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { Sparkles, Send, Plus, MessageSquare, Wrench } from "lucide-react";

export interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
  time: string;
  reasoning?: string;
  toolCalls?: any[];
}

export interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

interface ChatClientProps {
  initialChats: Chat[];
}

/* ─── Rich Text Renderer ─────────────────────────────────────────────── */
function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Detect bullet points
    const bulletMatch = trimmed.match(/^- (.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-on-surface-variant shrink-0">•</span>
          <span>{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
      return;
    }

    // Detect numbered list items
    const numberedMatch = trimmed.match(/^(\d+)\. (.+)$/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-on-surface-variant shrink-0">
            {numberedMatch[1]}.
          </span>
          <span>{renderInlineFormatting(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    elements.push(<div key={i}>{renderInlineFormatting(trimmed)}</div>);
  });

  return <>{elements}</>;
}

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatClient({ initialChats }: ChatClientProps) {
  const [chatList, setChatList] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingReasoning, setStreamingReasoning] = useState("");
  const [streamingTools, setStreamingTools] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set default active chat if none is selected
  useEffect(() => {
    if (chatList.length > 0 && !activeChatId) {
      setActiveChatId(chatList[0].id);
    }
  }, [chatList, activeChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList, streamingText, isTyping]);

  const activeChat = chatList.find((c) => c.id === activeChatId) || chatList[0];

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    const timeString = new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

    const userMsg: Message = {
      role: "USER",
      content: userMessageText,
      time: timeString,
    };

    // Update active chat's messages in state immediately
    const tempActiveChatId = activeChatId || `aichat-temp-${Date.now()}`;
    
    // Optimistically update lists
    setChatList((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      })
    );

    setInputValue("");
    setIsTyping(true);
    setStreamingText("");
    setStreamingReasoning("");
    setStreamingTools([]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          conversationId: activeChatId.startsWith("aichat-new") ? undefined : activeChatId,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let currentText = "";
      let currentReasoning = "";
      let currentTools: any[] = [];
      let resolvedConversationId = activeChatId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkString = decoder.decode(value);
        const lines = chunkString.split("\n\n");

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "meta") {
                resolvedConversationId = data.conversationId;
                
                // If we created a new session, rename the title and update active ID
                setChatList((prev) =>
                  prev.map((c) => {
                    if (c.id === activeChatId) {
                      return {
                        ...c,
                        id: resolvedConversationId,
                        title: data.title,
                      };
                    }
                    return c;
                  })
                );
                setActiveChatId(resolvedConversationId);
              } else if (data.type === "reasoning") {
                currentReasoning = data.content;
                setStreamingReasoning(currentReasoning);
              } else if (data.type === "tool_calls") {
                currentTools = data.content;
                setStreamingTools(currentTools);
              } else if (data.type === "chunk") {
                currentText += data.content;
                setStreamingText(currentText);
              } else if (data.type === "done") {
                setIsTyping(false);
              }
            } catch (e) {
              // Ignore partial JSON parsing errors if chunks are split across packets
            }
          }
        }
      }

      // Commit the completed streaming response to the state
      const finalAiMsg: Message = {
        role: "ASSISTANT",
        content: currentText,
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        }),
        reasoning: currentReasoning,
        toolCalls: currentTools,
      };

      setChatList((prev) =>
        prev.map((c) => {
          if (c.id === resolvedConversationId) {
            // Remove user message duplicates (if any) and append user + assistant pair
            const existingMessages = c.messages.filter(
              (m) => !(m.role === "USER" && m.content === userMessageText)
            );
            return {
              ...c,
              messages: [...existingMessages, userMsg, finalAiMsg],
            };
          }
          return c;
        })
      );
      
      setStreamingText("");
      setStreamingReasoning("");
      setStreamingTools([]);

    } catch (error) {
      console.error("Failed to fetch stream:", error);
      setIsTyping(false);
    }
  }

  function handleNewChat() {
    const newId = `aichat-new-${Date.now()}`;
    const newChatObj: Chat = {
      id: newId,
      title: "New Session",
      timestamp: "Just now",
      messages: [
        {
          role: "ASSISTANT",
          content: "Hello! I am Ledger AI. Ask me anything about your contacts, tasks, or business metrics.",
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ],
    };

    setChatList((prev) => [newChatObj, ...prev]);
    setActiveChatId(newId);
  }

  return (
    <div className="-mx-12 -my-8 flex min-h-[calc(100vh-0px)]">
      {/* ─── Left Panel: Chat History ──────────────────────────────── */}
      <div className="w-[280px] shrink-0 border-r border-hairline bg-surface-container-low flex flex-col">
        <div className="p-4 pb-3 border-b border-hairline">
          <div className="text-stamp-label text-on-surface-variant mb-3">
            AI · AGENT
          </div>
          <button
            onClick={handleNewChat}
            className="btn-primary w-full flex items-center justify-center gap-2 text-body-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2">
          {chatList.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-surface-container-lowest border-l-2 border-primary-container"
                    : "hover:bg-surface-container border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isActive ? "text-primary-container" : "text-on-surface-variant"
                    }`}
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-body-md font-medium truncate ${
                        isActive ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {chat.title}
                    </div>
                    <div className="text-utility-mono text-on-surface-variant mt-1">
                      {chat.timestamp}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right Panel: Active Chat ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-4 border-b border-hairline bg-surface-container-lowest flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-primary-container" strokeWidth={1.5} />
              <span className="text-utility-mono text-on-surface">{activeChat.title}</span>
              <span className="text-utility-mono text-on-surface-variant ml-auto">
                {activeChat.timestamp}
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {activeChat.messages.map((msg, idx) => {
                const isUser = msg.role === "USER";
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-lg p-3 ${
                          isUser
                            ? "bg-surface-container-high ml-auto"
                            : "bg-surface-container-lowest card-index"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-hairline">
                            <Sparkles className="w-3.5 h-3.5 text-primary-container" strokeWidth={1.5} />
                            <span className="text-stamp-label text-primary-container">LEDGER</span>
                          </div>
                        )}
                        <div className="text-body-md text-on-surface space-y-0.5 whitespace-pre-line">
                          {renderMessageContent(msg.content)}
                        </div>

                        {/* Explainability Section */}
                        {msg.reasoning && (
                          <div className="mt-3 pt-2 border-t border-hairline/40 text-[11px] font-mono text-primary-container bg-primary-fixed/5 p-2 rounded">
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-on-surface-variant font-bold">
                              <Sparkles className="w-3 h-3 text-primary-container" strokeWidth={1.5} />
                              <span>LEDGER REASONING PATH</span>
                            </div>
                            {msg.reasoning}
                          </div>
                        )}

                        {/* Executed Tools Badge */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.toolCalls.map((t: any, i: number) => (
                              <span
                                key={i}
                                className="stamp-badge text-[9px] text-secondary border-secondary flex items-center gap-1"
                              >
                                <Wrench className="w-2.5 h-2.5" strokeWidth={1.5} />
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`text-utility-mono text-on-surface-variant mt-1.5 ${isUser ? "text-right" : ""}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content (Active typing) */}
              {isTyping && (streamingText || streamingReasoning || streamingTools.length > 0) && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] bg-surface-container-lowest rounded-lg p-3 card-index w-full">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-hairline">
                      <Sparkles className="w-3.5 h-3.5 text-primary-container animate-pulse" strokeWidth={1.5} />
                      <span className="text-stamp-label text-primary-container">LEDGER IS THINKING...</span>
                    </div>

                    {/* Streamed Rationale */}
                    {streamingReasoning && (
                      <div className="text-[11px] font-mono text-primary-container bg-primary-fixed/5 p-2 rounded mb-3">
                        <div className="font-bold text-[10px] text-on-surface-variant mb-1">RATIONALE PATH:</div>
                        {streamingReasoning}
                      </div>
                    )}

                    {/* Streamed Tools */}
                    {streamingTools.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {streamingTools.map((t: any, i: number) => (
                          <span key={i} className="stamp-badge text-[9px] text-secondary border-secondary flex items-center gap-1">
                            <Wrench className="w-2.5 h-2.5 animate-spin" strokeWidth={1.5} />
                            Calling {t.name}...
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Streamed Reply */}
                    <div className="text-body-md text-on-surface whitespace-pre-line">
                      {streamingText ? renderMessageContent(streamingText) : "..."}
                    </div>
                  </div>
                </div>
              )}

              {/* General Loading Dots */}
              {isTyping && !streamingText && !streamingReasoning && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-lowest rounded-lg p-3 card-index max-w-[75%]">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Command Bar (Input) */}
            <div className="px-8 py-4">
              <form
                onSubmit={handleSendMessage}
                className="border border-on-surface bg-surface-container-lowest rounded-[var(--radius-default)] flex items-center gap-3 px-4 py-2.5"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Ledger anything..."
                  className="flex-1 bg-transparent text-body-md text-on-surface placeholder:font-mono placeholder:text-[13px] placeholder:text-on-surface-variant placeholder:tracking-[0.05em] outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="btn-primary !px-3 !py-2 flex items-center gap-1.5 text-body-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] font-mono text-on-surface-variant tracking-[0.05em]">
                  LEDGER AI · RESPONSES MAY BE INACCURATE
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-body-md text-on-surface-variant">No active chat sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
