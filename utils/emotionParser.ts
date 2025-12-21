import { EmotionData } from '../types';

export const emotionColors: Record<string, string> = {
  joy: "#22c55e",        // green
  calm: "#38bdf8",       // soft blue
  sadness: "#6366f1",    // indigo
  anxiety: "#f59e0b",    // amber
  fear: "#ef4444",       // red
  anger: "#dc2626",      // dark red
  loneliness: "#8b5cf6", // violet
  overwhelm: "#fb7185"   // rose
};

export function parseEmotionMetadata(text: string): EmotionData | undefined {
  const regex = /\[EMOTION:(.*?)\]/;
  const match = text.match(regex);

  if (!match) return undefined;

  try {
    // Expected format: emotion|intensity/10|keywords
    const content = match[1];
    const parts = content.split("|");
    
    if (parts.length < 3) return undefined;

    const emotion = parts[0].trim().toLowerCase();
    // Handle "8/10" or just "8"
    const intensityRaw = parts[1].replace('/10', '').trim();
    const intensity = parseInt(intensityRaw) || 5;
    const keywords = parts[2].split(",").map(k => k.trim());

    return {
      emotion,
      intensity,
      keywords
    };
  } catch (e) {
    console.warn("Failed to parse emotion metadata", e);
    return undefined;
  }
}

export function cleanAIText(text: string): string {
  return text.replace(/\[EMOTION:.*?\]/g, "").trim();
}
