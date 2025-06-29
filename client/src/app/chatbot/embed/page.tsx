"use client";
import ChatWindow from "@/components/ChatWindow";

export default function ChatbotEmbed() {
  return (
    <main className="flex h-screen w-full flex-col p-0 m-0">
      <div className="h-full w-full flex-grow overflow-hidden">
        <ChatWindow />
      </div>
    </main>
  );
}