import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, GroundingChunk } from "../types";

// Initialize the API client
// We create a factory or singleton to manage the instance
let aiClient: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    // Access API Key using process.env.API_KEY as per guidelines
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        throw new Error("API_KEY not found. Please add it to your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// Initialize or reset the chat session
export const initChatSession = async () => {
  const client = getClient();
  // Using gemini-3-flash-preview for reliable text chat and availability
  chatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Slightly creative but balanced for empathy
      tools: [{ googleSearch: {} }], // Enable Google Search grounding
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  if (!chatSession) {
    await initChatSession();
  }
  
  if (!chatSession) {
      throw new Error("Failed to initialize chat session");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return {
        text: response.text || "",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as unknown as GroundingChunk[] | undefined
    };
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

// Feature: Personalized Coping Strategy
// Generates a quick, actionable micro-habit based on emotional history
export const generateCopingStrategy = async (emotionHistory: string): Promise<string> => {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Act as an expert behavioral therapist. 
        Based on the user's recent emotional trajectory (oldest to newest): "${emotionHistory}".

        Recommend ONE specific, micro-habit or coping technique they can perform strictly within 2 minutes right now. 
        
        Guidelines:
        - If they are angry: focus on physical regulation (clenching/unclenching, cold water).
        - If they are anxious: focus on sensory grounding (5-4-3-2-1, texture touching).
        - If they are sad: focus on self-soothing or gentle movement.
        - If mixed/chaotic: focus on a single point of focus.

        Output Style: Direct, warm, actionable. No preamble. Max 35 words.
      `,
    });
    return response.text || "Try holding an ice cube in your hand until it melts to ground yourself.";
  } catch (error) {
    console.error("Coping Strategy Error:", error);
    return "Take three slow, deep breaths, counting to 4 on the inhale and 6 on the exhale.";
  }
};