// app/layout.tsx   (RootLayout)

import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar         from "@/components/navigation/Navbar";
import { CartProvider } from "./cart/CartContext";
import { GlobalProvider } from "@/context/GlobalState";
import ChatbotWidget  from "@/components/ChatbotWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SneakPeek",
  description: "AI-powered sneaker store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <GlobalProvider>
          <CartProvider>
            <Navbar />
            <div className="pt-18">{children}</div>
          </CartProvider>
        </GlobalProvider>

        {/* global floating bot */}
        <ChatbotWidget />
      </body>
    </html>
  );
}
