"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: `You said: ${newMessage.text}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        {messages.length === 0 && (
          <p className="text-gray-500">No conversations yet.</p>
        )}
        <ul>
          {messages
            .filter((msg) => msg.sender === "user")
            .map((msg) => (
              <li
                key={msg.id}
                className="mb-2 cursor-pointer hover:bg-gray-200 rounded p-2"
              >
                {msg.text.length > 30
                  ? msg.text.substring(0, 30) + "..."
                  : msg.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 mt-20">
              Start the conversation by typing below.
            </p>
          )}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-900"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs text-gray-600 mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-300 p-4 bg-white">
          <textarea
            rows={2}
            className="w-full border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
