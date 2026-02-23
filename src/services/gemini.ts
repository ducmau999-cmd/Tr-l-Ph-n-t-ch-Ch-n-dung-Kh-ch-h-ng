import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the Gemini API client
// We use a singleton pattern or just export a function to get the client
// to ensure we're always using the latest key if it changes (though in this env it's usually static)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const generatePersonaResponse = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  const ai = getAiClient();
  
  // Convert history to the format expected by the SDK
  // The SDK expects 'user' and 'model' roles
  const chatHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview", 
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Balance creativity and structure
    },
    history: chatHistory,
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
};
