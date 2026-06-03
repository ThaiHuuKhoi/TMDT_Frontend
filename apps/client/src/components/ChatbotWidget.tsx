"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import publicApi from "@/lib/api/publicClient";

type ChatMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Xin chào! Mình là trợ lý mua sắm KCG. Bạn cần tư vấn sản phẩm, đơn hàng hay chính sách nào không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Gọi API chatbot backend hiện tại: POST /api/chatbot/chat
      const res = await publicApi.post("/chatbot/chat", {
        sessionId: sessionId,
        message: trimmed,
      });

      const newSessionId: string | null = res.data?.sessionId || sessionId;
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }

      const replyText: string =
        res.data?.answer ||
        "Mình chưa hiểu câu hỏi này. Bạn có thể diễn đạt cụ thể hơn về sản phẩm, đơn hàng hoặc chính sách không?";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: replyText,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "bot",
          text: "Xin lỗi, hiện tại hệ thống tư vấn đang gặp sự cố. Bạn vui lòng thử lại sau ít phút nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi góc dưới phải */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-red-600 text-white shadow-xl w-14 h-14 flex items-center justify-center hover:bg-red-700 transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* Khung chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[320px] sm:w-[360px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-sm font-bold">
                K
              </div>
              <div>
                <p className="text-sm font-semibold">Trợ lý KCG</p>
                <p className="text-[11px] text-zinc-300">
                  Online • Tư vấn sản phẩm & đơn hàng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-h-[360px] overflow-y-auto px-3 py-3 space-y-2 bg-zinc-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-red-600 text-white rounded-br-sm"
                      : "bg-white text-zinc-900 border border-zinc-200 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 px-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang soạn câu trả lời...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-200 p-2 flex items-center gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 text-sm px-3 py-2 rounded-full border border-zinc-200 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center disabled:bg-zinc-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

