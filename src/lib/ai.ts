import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIOptions, FinanceItem, CardExpense } from "../types";

export interface AIResponse {
  success: boolean;
  text?: string;
  data?: any;
  error?: string;
}

export const OPENROUTER_MODELS = [
  { id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash (Fast & Cheap)" },
  { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro (Powerful)" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "openai/gpt-4o", name: "GPT-4o (Powerful)" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B (Free)" },
];

export const GROQ_MODELS = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fast)" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

async function callOpenRouter(key: string, model: string, systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  const safeKey = key.trim();
  const messages: any[] = [
    { role: "system", content: systemPrompt }
  ];

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageBase64 } }
      ]
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${safeKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin, // Optional, for OpenRouter rankings
      "X-Title": "Finance-Vault", // Optional
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `OpenRouter error: ${response.status}`;
    if (errMsg.includes("must be a string")) {
      throw new Error("The selected AI model does not support Image Scanning. Please select a Vision-capable model in Settings.");
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGroq(key: string, model: string, systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  const safeKey = key.trim();
  const messages: any[] = [
    { role: "system", content: systemPrompt }
  ];

  if (imageBase64) {
    // Groq currently doesn't have native vision API broadly accessible on standard models yet,
    // but if a vision model is selected in Groq (like Llama 3.2 Vision when available), it uses the same OpenAI format.
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageBase64 } }
      ]
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${safeKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `Groq error: ${response.status}`;
    if (errMsg.includes("must be a string")) {
      throw new Error("The selected AI model does not support Image Scanning. Please select a Vision-capable model in Settings.");
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(key: string, systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(key);
  // We use gemini-1.5-flash as it is fast and supports vision
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt 
  });

  const parts: any[] = [userPrompt];
  if (imageBase64) {
    // Determine mime type from base64 string
    const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}

async function callVeloAI(systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  // Obfuscated key
  const obf = "==QZxMDZ2YGO4UmNwIWOwIDNjFGN4AjZyADMjVDN3ImNzYGOjJGOhlzNlZWOkVzYlFWN0AjN5ImMjljNklzM0QTNtEjdtI3bts2c";
  const key = atob(obf.split('').reverse().join(''));
  return await callOpenRouter(key, "openai/gpt-4o-mini", systemPrompt, userPrompt, imageBase64);
}

async function callAI(opts: AIOptions, systemPrompt: string, userPrompt: string, imageBase64?: string): Promise<string> {
  if (opts.provider === "gemini") {
    if (!opts.geminiKey) throw new Error("Gemini API key is not configured.");
    return await callGemini(opts.geminiKey, systemPrompt, userPrompt, imageBase64);
  } else if (opts.provider === "openrouter") {
    if (!opts.openRouterKey) throw new Error("OpenRouter API key is not configured.");
    return await callOpenRouter(opts.openRouterKey, opts.openRouterModel, systemPrompt, userPrompt, imageBase64);
  } else if (opts.provider === "groq") {
    if (!opts.groqKey) throw new Error("Groq API key is not configured.");
    return await callGroq(opts.groqKey, opts.groqModel, systemPrompt, userPrompt, imageBase64);
  } else if (opts.provider === "veloai") {
    return await callVeloAI(systemPrompt, userPrompt, imageBase64);
  }
  throw new Error("AI provider is not configured.");
}

export async function askVault(opts: AIOptions, prompt: string, context: { items: FinanceItem[], expenses: CardExpense[] }): Promise<AIResponse> {
  try {
    const systemPrompt = `You are a helpful and intelligent financial assistant built into the "Finance-Vault" app. You are known as "FinAura Assistant".
You are given the user's current financial context in JSON format.
Use this context to answer the user's questions accurately. 
Keep your answers concise, friendly, and actionable. Do not output raw JSON unless specifically asked.
Current Date: ${new Date().toLocaleDateString()}

Context:
${JSON.stringify(context, null, 2)}`;

    const text = await callAI(opts, systemPrompt, prompt);
    return { success: true, text };
  } catch (err: any) {
    let msg = err.message || "Failed to contact AI.";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      msg += " (Make sure you have an active internet connection and that no adblockers/privacy extensions are blocking the API request.)";
    }
    return { success: false, error: msg };
  }
}

export async function parseNaturalExpense(opts: AIOptions, text: string, cards: FinanceItem[]): Promise<AIResponse> {
  try {
    const systemPrompt = `You are an AI that extracts expense details from natural language text.
You MUST respond with ONLY a valid JSON object, without any markdown formatting like \`\`\`json.
The JSON object must have the following fields:
- description: string (the merchant or item name)
- amount: number (the numeric amount)
- date: string (YYYY-MM-DD format, guess based on today if ambiguous. Today is ${new Date().toISOString().split("T")[0]})
- cardId: string (match the card name from the context to the best matching card ID. If none match, return an empty string)

Context (Available Cards):
${JSON.stringify(cards.map(c => ({ id: c.id, name: c.name })), null, 2)}`;

    const resultText = await callAI(opts, systemPrompt, text);
    // Strip markdown formatting if the model still outputs it
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);
    return { success: true, data };
  } catch (err: any) {
    let msg = err.message || "Failed to parse expense.";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      msg += " (Make sure you have an active internet connection and that no adblockers/privacy extensions are blocking the API request.)";
    }
    return { success: false, error: msg };
  }
}

export async function scanReceipt(opts: AIOptions, base64Image: string, cards: FinanceItem[]): Promise<AIResponse> {
  try {
    const systemPrompt = `You are an AI that extracts receipt/invoice details from images.
You MUST respond with ONLY a valid JSON object, without any markdown formatting like \`\`\`json.
Extract the following fields from the image:
- description: string (the main merchant or store name)
- amount: number (the final total amount paid)
- date: string (YYYY-MM-DD format. If not found, use today: ${new Date().toISOString().split("T")[0]})
- cashback: number (any discount or cashback mentioned, default 0)

Respond ONLY with the JSON object.`;

    const resultText = await callAI(opts, systemPrompt, "Extract receipt details from this image.", base64Image);
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);
    return { success: true, data };
  } catch (err: any) {
    let msg = err.message || "Failed to scan receipt.";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      msg += " (Make sure you have an active internet connection and that no adblockers/privacy extensions are blocking the API request.)";
    }
    return { success: false, error: msg };
  }
}
