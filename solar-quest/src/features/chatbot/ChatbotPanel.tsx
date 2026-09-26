// ===================================================================
// 🤖 CHATBOT PANEL - UI GIAO DIỆN CHAT VỚI AI
// ===================================================================
//
// Component này hiển thị:
// - Floating chat window với minimize/maximize
// - Message history với scroll tự động
// - Input field với send button
// - Suggested questions theo role
// - Unlock "Conversationalist" badge sau 10 tin nhắn
//
// ===================================================================

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bot, MessageCircle, Send, X, Sparkles, Radio } from "lucide-react";
import type { AICompanionData } from "@/types/victory";
import type { PlanetProfile } from "@/types/profile";
import {
  sendChatMessage,
  getIntroMessage,
  getSuggestedQuestions,
  type ChatMessage,
} from "@/services/geminiChatbot";
import { unlockBadge } from "@/services/profileStorage";

interface ChatbotPanelProps {
  planetId: string;
  planetName: string;
  ai: AICompanionData;
  profile: PlanetProfile | null;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatbotPanel({
  planetId,
  planetName,
  ai,
  profile,
  isOpen,
  onToggle,
}: ChatbotPanelProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show intro message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const intro = getIntroMessage(ai, planetName, profile);
      setMessages([{ role: "model", parts: intro }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    // Add user message to history
    const newUserMessage: ChatMessage = { role: "user", parts: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Send to Gemini API
      const conversationHistory = [...messages, newUserMessage].slice(-6);
      const response = await sendChatMessage(
        planetId,
        planetName,
        ai,
        userMessage,
        conversationHistory,
        profile
      );

      // Add AI response to history
      const aiMessage: ChatMessage = { role: "model", parts: response };
      setMessages((prev) => [...prev, aiMessage]);

      // Check for Conversationalist badge (10+ user messages)
      const userMessageCount =
        conversationHistory.filter((msg) => msg.role === "user").length + 1;
      if (userMessageCount >= 10 && profile) {
        unlockBadge(planetId, "Conversationalist");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "model",
        parts: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại! 🛠️",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const suggestedQuestions = getSuggestedQuestions(planetId, profile?.role);

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        onClick={onToggle}
        className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-[#07101c]/80 shadow-[0_20px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${ai.color}  , ${ai.color})`,
          backdropFilter: "blur(10px)",
          border: `2px solid ${ai.color}60`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Bot className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>
    );
  }

  // Chat panel
  return (
    <motion.div
      className="fixed bottom-5 right-5 z-50 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#07101c]/90 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      style={{
        background: `linear-gradient(135deg, ${ai.color}20, ${ai.color}40)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${ai.color}35`,
        width: "min(390px, calc(100vw - 2rem))",
        height: "min(560px, calc(100vh - 2rem))",
      }}
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 100 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header */}
      <div
        className="relative flex flex-shrink-0 items-center justify-between border-b border-white/8 p-4"
        style={{ background: `${ai.color}60` }}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
            {ai.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#07101c] bg-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-white text-sm">{ai.name}</div>
              <Radio className="h-3 w-3 text-emerald-300/80" />
            </div>
            <div className="text-xs text-white/80">
              {(i18n.language || "en").startsWith("en")
                ? ai.titleEn ?? ai.title
                : ai.title}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="rounded-xl border border-white/8 bg-white/[0.035] p-2 text-white/50 transition-colors hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`max-w-[80%] p-2.5 rounded-2xl text-sm ${
                message.role === "user"
                  ? "border border-cyan-200/15 bg-cyan-200/[0.12] text-white"
                  : "border border-white/8 bg-white/[0.045] text-white/85"
              }`}
            >
              {message.parts}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white/20 text-white p-2.5 rounded-2xl flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{t("chatbot.thinking")}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 border-t border-white/6 px-4 pb-3 pt-3">
          <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
            {t("chatbot.suggestedQuestions")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-white/55 transition-colors hover:border-cyan-200/20 hover:bg-cyan-200/[0.06] hover:text-white"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/8 bg-black/20 p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t('chatbot.placeholder')}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-cyan-200/30 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="rounded-xl border border-cyan-200/15 bg-cyan-200/[0.07] p-2.5 transition-colors hover:border-cyan-200/30 hover:bg-cyan-200/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
