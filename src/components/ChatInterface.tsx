"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  isFallback?: boolean;
  fallbackMessage?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display the specific error message from the API
        const errorMessage: Message = {
          id: Date.now() + 1,
          sender: "ai",
          text:
            data.error ||
            "Sorry, I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Handle both AI and fallback responses
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.response,
        timestamp: new Date(),
        isFallback: data.isFallback,
        fallbackMessage: data.message,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Chat History</h2>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <div className="text-4xl mb-4">💬</div>
            <p>No conversations yet.</p>
            <p className="text-sm mt-2">Start chatting with our AI tutor!</p>
          </div>
        )}
        <div className="space-y-3">
          {messages
            .filter((msg) => msg.sender === "user")
            .map((msg) => (
              <div
                key={msg.id}
                className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-l-4 border-blue-400"
              >
                <p className="text-sm text-gray-700 font-medium truncate">
                  {msg.text.length > 40
                    ? msg.text.substring(0, 40) + "..."
                    : msg.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">AI Tutor</h3>
                <p className="text-sm text-gray-500">Online • Ready to help</p>
              </div>
            </div>
            {messages.some((msg) => msg.isFallback) && (
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-xs font-medium text-amber-700">
                  Educational Assistant Mode
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">
                Welcome to AI Tutor!
              </h3>
              <p className="max-w-md mx-auto">
                I&apos;m here to help you with your studies. Ask me anything
                about your subjects, homework, or learning challenges!
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {msg.fallbackMessage && msg.sender === "ai" && (
                <div className="flex justify-start mt-1 ml-2">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{msg.fallbackMessage}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-3">
            <textarea
              rows={1}
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ask me anything about your studies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isTyping ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send •{" "}
            {messages.some((msg) => msg.isFallback)
              ? "Educational Assistant Mode active"
              : "AI responses powered by GPT-3.5"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
