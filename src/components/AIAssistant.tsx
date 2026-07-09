import { customAlert, customConfirm } from "../components/CustomAlert";
import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, RefreshCw, Trash2, Mic } from "lucide-react";
import { AIOptions, FinanceItem, CardExpense } from "../types";
import { askVault, AIResponse } from "../lib/ai";
import { executeAITool } from "../lib/ai-tools";

interface Props {
  aiOpts: AIOptions;
  contextData: { items: FinanceItem[]; expenses: CardExpense[] };
  onClose: () => void;
  onDataChanged: () => void;
}

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  loading?: boolean;
}

export default function AIAssistant({ aiOpts, contextData, onClose, onDataChanged }: Props) {
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
    
    const currentMessages = [...messages, userMsg];
    setMessages([...currentMessages, loadingMsg]);
    setIsTyping(true);

    let apiMessages = currentMessages
      .filter(m => m.id !== "welcome" && !m.loading)
      .map(m => ({ role: m.role, content: m.text }));

    let response: AIResponse = await askVault(aiOpts, apiMessages, contextData);

    while (response.success && response.data?.type === "tool_call") {
      const toolCall = response.data;
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          id: loadingMsg.id,
          role: "ai",
          text: `Executing action: ${toolCall.tool_call}...`,
          loading: true
        };
        return newMsgs;
      });

      const toolResult = await executeAITool(toolCall.tool_call, toolCall.arguments);
      
      onDataChanged();

      apiMessages.push({ role: "ai", content: response.text || "" });
      apiMessages.push({ role: "user", content: `SYSTEM: Tool execution result: ${toolResult}` });

      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          id: loadingMsg.id,
          role: "ai",
          text: "Thinking...",
          loading: true
        };
        return newMsgs;
      });

      response = await askVault(aiOpts, apiMessages, contextData);
    }

    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = {
        id: loadingMsg.id,
        role: "ai",
        text: response.success && response.text ? response.text.replace(/```json[\s\S]*?```/g, "").trim() : (response.error || "Sorry, I couldn't process that.")
      };
      return newMsgs;
    });
    setIsTyping(false);
  }

  function handleMic() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      customAlert("Speech recognition is not supported in this browser.");
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
