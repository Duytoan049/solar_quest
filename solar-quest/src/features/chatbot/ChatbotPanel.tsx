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
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
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
      const conversationHistory = [...messages, newUserMessage];
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
        className="fixed bottom-20 right-6 z-50 p-4 rounded-full shadow-2xl"
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
        <MessageCircle className="w-6 h-6 text-white" />
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
      className="fixed bottom-6 right-6 z-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${ai.color}20, ${ai.color}40)`,
        backdropFilter: "blur(20px)",
        border: `2px solid ${ai.color}60`,
        width: "380px",
        height: "520px",
      }}
      initial={{ scale: 0.8, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 100 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 flex-shrink-0"
        style={{ background: `${ai.color}60` }}
      >
        <div className="flex items-center gap-2">
          <div className="text-2xl">{ai.avatar}</div>
          <div>
            <div className="font-bold text-white text-sm">{ai.name}</div>
            <div className="text-xs text-white/80">{ai.title}</div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
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
                  ? "bg-blue-500 text-white"
                  : "bg-white/20 text-white"
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
              <span>Đang suy nghĩ...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="text-xs text-white/60 mb-2">💡 Gợi ý câu hỏi:</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-black/20 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Hỏi tôi về hành tinh này..."
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
