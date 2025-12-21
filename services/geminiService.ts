import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../types";

// Initialize the API client
// We create a factory or singleton to manage the instance
let aiClient: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

// Initialize or reset the chat session
export const initChatSession = async () => {
  const client = getClient();
  // Using gemini-2.5-flash-lite-latest for fast, responsive standard chat
  chatSession = client.chats.create({
    model: 'gemini-2.5-flash-lite-latest',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Slightly creative but balanced for empathy
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initChatSession();
  }
  
  if (!chatSession) {
      throw new Error("Failed to initialize chat session");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

// Feature: Deep Reflection using Thinking Budget
// This uses a stronger model to analyze the conversation or provide a deeper response
export const generateDeepReflection = async (context: string): Promise<string> => {
  const client = getClient();
  
  try {
    // Using gemini-3-pro-preview with thinking budget for complex reasoning
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        Based on the following user context, provide a deep, empathetic reflection. 
        Identify core underlying emotions and suggest a specific, personalized grounding technique.
        Do not be alarmist. Be calm and supportive.
        
        Context: "${context}"
      `,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Allocate thinking tokens for better reasoning
      }
    });
    return response.text || "I'm here for you. Take a deep breath.";
  } catch (error) {
    console.error("Gemini Deep Reflection Error:", error);
    // Fallback if thinking model fails or is unavailable
    return "I'm having trouble reflecting deeply right now, but I am here to listen. Tell me more about how you feel.";
  }
};
