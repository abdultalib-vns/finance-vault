import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RefreshCw } from "lucide-react";
import { AIOptions, FinanceItem, CardExpense } from "../types";
import { askVault, AIResponse } from "../lib/ai";

interface Props {
  aiOpts: AIOptions;
  contextData: { items: FinanceItem[]; expenses: CardExpense[] };
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  loading?: boolean;
}

export default function AIAssistant({ aiOpts, contextData, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Hello! I am your personal FinAura Assistant. Ask me anything about your balances, upcoming dues, or spending habits."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput("");
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: userText };
    const loadingMsg: Message = { id: Date.now().toString() + "-ai", role: "ai", text: "Thinking...", loading: true };
    
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsTyping(true);

    const response: AIResponse = await askVault(aiOpts, userText, contextData);

    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = {
        id: loadingMsg.id,
        role: "ai",
        text: response.success && response.text ? response.text : (response.error || "Sorry, I couldn't process that.")
      };
      return newMsgs;
    });
    setIsTyping(false);
  }

  const promptSuggestions = [
    "How much did I spend this month?",
    "When is my next FD maturing?",
    "What is my highest credit card bill?"
  ];

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant-panel">
        <div className="ai-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="ai-header-icon"><Bot size={20} /></div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>FinAura Assistant</h3>
          </div>
          <button className="ai-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="ai-chat-history">
          {messages.map(m => (
            <div key={m.id} className={`ai-msg-row ${m.role}`}>
              <div className="ai-msg-avatar">
                {m.role === "ai" ? <Sparkles size={14} /> : <User size={14} />}
              </div>
              <div className={`ai-msg-bubble ${m.loading ? 'loading' : ''}`}>
                {m.loading ? (
                  <span className="ai-typing"><RefreshCw size={14} className="spin" /> Thinking...</span>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br/>") }} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="ai-suggestions">
          {promptSuggestions.map((s, i) => (
            <button key={i} className="ai-suggestion-btn" onClick={() => { setInput(s); setTimeout(handleSend, 50); }}>
              {s}
            </button>
          ))}
        </div>

        <form className="ai-input-form" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask anything..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="ai-chat-input"
          />
          <button type="submit" className="ai-send-btn" disabled={!input.trim() || isTyping}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
