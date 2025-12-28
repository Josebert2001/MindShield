# 🛡️ MindShield

**Private, AI-Powered Mental Health Support**

MindShield is a privacy-first, text-based AI mental health assistant designed to provide compassionate emotional support, reflection, and grounding techniques without storing personal data.

## 🌟 Mission

Many individuals experience emotional distress but avoid seeking help due to stigma, fear of judgment, or lack of accessible resources. MindShield aims to bridge this gap by offering a safe, anonymous space to feel heard and grounded.

**Core Philosophy:** Help the user feel heard, grounded, and supported — not fixed.

## ✨ Key Features

### 1. 💬 Text-Based Emotional Support
*   **Natural Conversation:** Uses advanced AI to provide calm, empathetic, and non-judgmental responses.
*   **Privacy-First:** No login required. No chat history is stored on servers. Once the session ends, the data is gone.
*   **Model:** Powered by `gemini-3-flash-preview` for fast, responsive interaction.

### 2. 🧠 Deep Reflection Mode
*   **Advanced Reasoning:** Users can request a "Deep Reflection" where the AI analyzes the conversation context to identify underlying emotions and patterns.
*   **Thinking Capability:** Utilizes `gemini-3-pro-preview` with a dedicated **Thinking Budget** to generate profound, personalized insights rather than generic advice.

### 3. 🔍 Search Grounding
*   **Real-Time Information:** When relevant, the AI can securely search the web using Google Search to provide up-to-date information on mental health resources, coping techniques, or scientific concepts.
*   **Transparent Sources:** Citations and source links are displayed directly in the chat to ensure trust and transparency.

### 4. 🌬️ Grounding Tools
*   **Interactive Breathing Exercise:** A built-in "Box Breathing" tool (4-4-4-4 technique) to help users physically calm their nervous system during moments of high anxiety.
*   **Visual Guidance:** Soothing animations to guide the breathing rhythm.

### 5. 🚨 Distress Detection & Safety
*   **Guardrails:** The AI is trained to detect signs of self-harm or extreme distress.
*   **Crisis Handling:** Responds with empathy and encourages real-world professional help without being alarmist.
*   **Disclaimer:** MindShield clearly states it is not a replacement for professional therapy or medical treatment.

## 🛠️ Technical Architecture

MindShield is built as a lightweight, responsive web application.

*   **Frontend:** React 19, Tailwind CSS, Lucide React Icons.
*   **AI Integration:** Google Gemini API (`@google/genai` SDK).
*   **State Management:** React Hooks (Session-based, non-persistent).

### AI Models Used

| Feature | Model | Reasoning |
| :--- | :--- | :--- |
| **Main Chat & Search** | `gemini-3-flash-preview` | Fast latency, high availability. Equipped with `googleSearch` tool for grounding responses in real-world data. |
| **Deep Reflection** | `gemini-3-pro-preview` | High reasoning capability. Configured with `thinkingConfig` to allow "thought" before answering complex emotional queries. |

## 🚀 Getting Started

1.  **API Key:** This application requires a Google Gemini API Key.
2.  **Environment:** The API key is accessed via `process.env.API_KEY`.
3.  **Run:**
    *   Ensure dependencies are installed (`react`, `react-dom`, `@google/genai`, `lucide-react`, `react-markdown`).
    *   Mount the app to the root element.

## 🔒 Privacy & Ethics

*   **No Database:** We do not maintain a database of user conversations.
*   **Client-Side Only:** State exists only within the user's browser session.
*   **Transparent Limits:** The UI clearly communicates that this is an AI tool, not a human therapist.

## ⚠️ Important Disclaimer

MindShield is an AI-powered tool for emotional support and self-reflection. **It is not a medical device and does not provide clinical diagnoses or medical advice.**

If you or someone you know is in immediate danger, please contact your local emergency services or a crisis hotline immediately.