import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RefreshCw, Trash2, Mic } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem("finaura_ai_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [{
      id: "welcome",
      role: "ai",
      text: "Hello! I am your personal FinAura Assistant. Ask me anything about your balances, upcoming dues, or spending habits."
    }];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem("finaura_ai_chat", JSON.stringify(messages));
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

  function handleMic() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ai-close-btn" onClick={() => setMessages([{
              id: "welcome",
              role: "ai",
              text: "Hello! I am your personal FinAura Assistant. Ask me anything about your balances, upcoming dues, or spending habits."
            }])} title="Clear Chat"><Trash2 size={18} /></button>
            <button className="ai-close-btn" onClick={onClose} title="Close"><X size={20} /></button>
          </div>
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

        {messages.length === 1 && (
          <div className="ai-suggestions">
            {promptSuggestions.map((s, i) => (
              <button key={i} className="ai-suggestion-btn" onClick={() => { setInput(s); setTimeout(handleSend, 50); }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form className="ai-input-form" onSubmit={handleSend}>
          <button type="button" onClick={handleMic} disabled={isTyping} style={{ background: "transparent", border: "none", color: isListening ? "var(--primary)" : "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "0 4px" }} title="Voice Input">
            <Mic size={20} style={{ animation: isListening ? "pulse 1.5s infinite" : "none" }} />
          </button>
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
