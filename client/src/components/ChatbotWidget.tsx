"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ping, setPing] = useState(false);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setPing(true), 15000);
      return () => clearTimeout(t);
    }
    setPing(false);
  }, [open]);

  if (pathname.startsWith("/chatbot/embed")) return null;

  return (
    <>
      <button
        aria-label="Chatbot launcher"
        className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black transition-all ${open ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <Bot size={24} />}
        {ping && !open && <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-red-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            key="chatbot"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 h-[70vh] w-[380px] p-0 m-0 overflow-hidden rounded-2xl shadow-2xl"
          >
            <iframe
              src="/chatbot/embed"
              title="SneakPeek Chatbot"
              className="h-full w-full border-none"
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}