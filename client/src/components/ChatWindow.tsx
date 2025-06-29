"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Send, Loader2 } from "lucide-react";

// One source of truth for the API endpoint
const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API ?? "http://localhost:9000/api/chatbot/ask";

type Message = { id: number; text: string; sender: "user" | "assistant" };

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Hello! I can help you find shoes. What kind of shoes are you looking for?",
    sender: "assistant"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // always scroll to newest
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => inputRef.current?.focus(), []);

  async function send(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });
      const { reply } = await res.json();

      const botMsg: Message = { id: Date.now() + 1, text: reply, sender: "assistant" };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, error occured", sender: "assistant" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col p-0 m-0">
      {/* Header */}
      <header className="flex items-center space-x-2 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"><Bot size={18} /></div>
        <div>
          <h3 className="font-medium">SneakPeek Assistant</h3>
          <p className="text-xs text-gray-500">Online • Shoe Expert</p>
        </div>
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "assistant" && (
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"><Bot size={16} className="text-gray-700" /></div>) }

            <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${m.sender === "user" ? "rounded-tr-none bg-black text-white" : "rounded-tl-none border border-gray-200 bg-white text-gray-900 shadow-sm"}`}>
              {m.sender === "assistant" ? (
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-black-600 underline" />
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              ) : m.text}
            </div>

            {m.sender === "user" && (
              <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-800"><User size={16} className="text-white" /></div>) }
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"><Bot size={16} className="text-gray-700" /></div>
            <div className="flex space-x-1 rounded-2xl rounded-tl-none border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </section>

      {/* Input */}
      <form onSubmit={send} className="border-t border-gray-200 p-4">
        <div className="relative">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ayakkabı sorunuzu yazın…"
            className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 pr-12 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black p-2 text-white transition-all hover:bg-gray-800 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}