"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  MessageCircle,
  CheckCheck,
  Clock,
} from "lucide-react";
import { conversationAPI, personaAPI } from "@/lib/api";
import type { Persona } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "read";
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0);
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      console.log("Loading personas for chat...");
      const data = await personaAPI.list();
      console.log("Personas loaded for chat:", data);
      setPersonas(data);
      if (data.length > 0) {
        // Add a welcome message from the first persona
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hello! I'm ${data[0].name}. ${
              data[0].description || "How can I help you today?"
            }`,
            timestamp: new Date(),
            status: "read",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load personas:", err);
      let errorMessage = "Failed to load personas";
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When persona changes, reset conversation
  useEffect(() => {
    if (personas.length > 0 && personas[selectedPersonaIndex]) {
      setConversationId(undefined);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: `Hello! I'm ${personas[selectedPersonaIndex].name}. ${
            personas[selectedPersonaIndex].description ||
            "How can I help you today?"
          }`,
          timestamp: new Date(),
          status: "read",
        },
      ]);
    }
  }, [selectedPersonaIndex, personas]);

  const handleSend = async () => {
    if (!input.trim() || !personas[selectedPersonaIndex]?.id || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      console.log("Sending chat message:", {
        personaId: personas[selectedPersonaIndex].id,
        conversationId,
        message: input,
      });

      const response = await conversationAPI.chat({
        personaId: personas[selectedPersonaIndex].id!,
        conversationId,
        message: input,
      });

      console.log("Chat response received:", response);

      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Mark user message as sent
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: "sent" as const } : m
        )
      );

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: response.personaResponse,
        timestamp: new Date(),
        status: "read",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      let errorMessage = "Failed to send message";
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running.";
        } else if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      // Mark user message as failed
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const getPersonaInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getPersonaColor = (index: number) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ];
    return colors[index % colors.length];
  };

  if (personas.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-white text-lg">No personas available</p>
          <p className="text-muted-foreground">
            Create a persona first to start chatting
          </p>
          <button
            onClick={loadPersonas}
            className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Personas Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-3 max-h-48 md:max-h-full overflow-y-auto">
        <h3 className="font-semibold text-white px-2">Available Personas</h3>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {personas.map((persona, idx) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersonaIndex(idx)}
              className={`shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                selectedPersonaIndex === idx
                  ? "glassmorphic border border-accent/50 bg-white/10"
                  : "glassmorphic hover:bg-white/10"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-linear-to-br ${getPersonaColor(
                  idx
                )} flex items-center justify-center text-white font-bold text-sm shrink-0`}
              >
                {getPersonaInitials(persona.name)}
              </div>
              <div className="text-left min-w-0 flex-1 hidden md:block">
                <p className="font-semibold text-white text-sm truncate">
                  {persona.name}
                </p>
                <p className="text-xs text-green-400">Ready</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glassmorphic flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-linear-to-br ${getPersonaColor(
                selectedPersonaIndex
              )} flex items-center justify-center text-white font-bold`}
            >
              {getPersonaInitials(personas[selectedPersonaIndex].name)}
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {personas[selectedPersonaIndex].name}
              </h2>
              <p className="text-xs text-green-400">
                {personas[selectedPersonaIndex].description || "Online • Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`flex gap-3 max-w-md ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {message.role === "assistant" && (
                  <div
                    className={`w-8 h-8 rounded-lg bg-linear-to-br ${getPersonaColor(
                      selectedPersonaIndex
                    )} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                  >
                    {getPersonaInitials(personas[selectedPersonaIndex].name)}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-br-none"
                      : "bg-white/10 text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${
                      message.role === "user"
                        ? "text-white/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.role === "user" && (
                      <>
                        {message.status === "sending" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {message.status === "sent" && (
                          <CheckCheck className="w-3 h-3" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-linear-to-br ${getPersonaColor(
                    selectedPersonaIndex
                  )} flex items-center justify-center shrink-0`}
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button className="p-3 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
                if (e.key === "Escape") {
                  setError(null);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
