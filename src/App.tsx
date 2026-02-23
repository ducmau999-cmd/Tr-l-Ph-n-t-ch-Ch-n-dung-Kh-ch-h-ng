import { useState, useRef, useEffect } from "react";
import { generatePersonaResponse, ChatMessage } from "./services/gemini";
import { Send, User, Bot, Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";
import { PERSONA_NAME, USER_NAME } from "./constants";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = async () => {
    setHasStarted(true);
    setIsLoading(true);
    try {
      const response = await generatePersonaResponse([], "Xin chào, hãy bắt đầu quy trình.");
      setMessages([
        { role: "model", text: response }
      ]);
    } catch (error) {
      console.error("Error starting chat:", error);
      setMessages([
        { role: "model", text: "Xin lỗi, đã có lỗi xảy ra khi khởi động. Vui lòng kiểm tra API Key." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setHasStarted(false);
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generatePersonaResponse(messages, input);
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick actions for Step 3
  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Strategic Persona Architect</h1>
              <p className="text-xs text-slate-500">Kiến trúc sư Chân dung Khách hàng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full hidden sm:block">
              {PERSONA_NAME} & {USER_NAME}
            </div>
            {hasStarted && (
              <button 
                onClick={handleReset}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Bắt đầu lại"
              >
                <RefreshCw size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"
            >
              <User size={40} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-slate-900"
            >
              Xin chào, {USER_NAME}!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 max-w-md"
            >
              Tôi là {PERSONA_NAME}, Kiến trúc sư Chân dung Khách hàng Chiến lược. 
              Tôi ở đây để giúp bạn thấu hiểu khách hàng và xây dựng chiến lược nội dung đột phá.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleStart}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Bắt đầu phân tích"}
            </motion.button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 pb-24">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-indigo-600 text-white"
                  }`}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                    msg.role === "user" 
                      ? "bg-white text-slate-900 border border-slate-100" 
                      : "bg-white text-slate-900 border border-indigo-100 shadow-indigo-50"
                  }`}>
                    <div className="markdown-body prose prose-slate prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-indigo-50 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="animate-spin" size={14} />
                  <span>{PERSONA_NAME} đang phân tích...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      {hasStarted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Quick Actions Hints - Only show if last message was from model and contains options */}
            {messages.length > 0 && messages[messages.length - 1].role === "model" && (
               messages[messages.length - 1].text.includes("1.") && 
               messages[messages.length - 1].text.includes("2.") && 
               messages[messages.length - 1].text.includes("3.")
            ) && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => handleQuickAction("1")} className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-indigo-100">
                  1. Kế hoạch 7 ngày
                </button>
                <button onClick={() => handleQuickAction("2")} className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-indigo-100">
                  2. Quảng cáo Facebook
                </button>
                <button onClick={() => handleQuickAction("3")} className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-indigo-100">
                  3. Kịch bản TikTok
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập thông tin khách hàng hoặc chọn phương án..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-[52px] max-h-32 shadow-inner"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-400">
              AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
