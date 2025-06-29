// pages/index.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I can help you find shoes. What kind of shoes are you looking for?", sender: 'bot' }
  ]); 
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Call the API
      const response = await axios.post('http://localhost:9000/api/chatbot/ask', {
        message: userMessage.text
      });
      
      // Add bot response to chat
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.data.reply,
        sender: 'bot'
      };
      
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process your request. Please try again later.",
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error fetching response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>Sneakpeek Shopping Assistant</title>
        <meta name="description" content="AI-powered shoe shopping assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sneakpeek Shopping Assistant</h1>
          <p className="text-sm text-gray-600">Ask me about any shoes you're looking for</p>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-4xl w-full mx-auto px-4">
        <div className="flex-grow overflow-y-auto py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-5 py-4 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.sender === 'bot' ? (
                  <div className="prose prose-sm">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-4" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-4 mb-2" {...props} />,
                        a: ({node, href, ...props}) => (
                          <a 
                            className="text-black underline hover:text-gray-600 transition-colors" 
                            target="_blank"
                            rel="noopener noreferrer"
                            href={href}
                            {...props} 
                          />
                        ),
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 mt-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 mt-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-gray-400 pl-4 italic my-4" {...props} />
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-5 py-4 rounded-lg bg-gray-200 text-gray-900">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 py-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about shoes..."
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors font-medium"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}