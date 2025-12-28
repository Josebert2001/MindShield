# 🛡️ MindShield

**Private, AI-Powered Mental Health Support**

MindShield is a privacy-first, AI mental health assistant designed to provide compassionate emotional support, reflection, and grounding techniques without storing personal data.

## ⚠️ Security Note for Production

This prototype uses client-side API key storage (`import.meta.env`) for demonstration purposes. 
**In a production environment, the API key must be secured server-side using:**
- Serverless functions (Vercel/Netlify)
- Backend API proxy
- Environment variable management systems

The current implementation is suitable for controlled demo environments only.

## 🌟 Mission

Many individuals experience emotional distress but avoid seeking help due to stigma, fear of judgment, or lack of accessible resources. MindShield aims to bridge this gap by offering a safe, anonymous space to feel heard and grounded.

**Core Philosophy:** Help the user feel heard, grounded, and supported — not fixed.

## ✨ Key Features

### 1. 💬 Text & Voice Support
*   **Natural Conversation:** Uses advanced AI to provide calm, empathetic, and non-judgmental responses.
*   **Voice Dictation:** Integrated microphone support allowing users to speak their thoughts naturally instead of typing.
*   **Privacy-First:** No login required. No chat history is stored on servers. Once the session ends, the data is gone.

### 2. 📊 Real-Time Emotion Analytics
*   **Emotional Timeline:** A visual "health bar" at the top of the chat that tracks the emotional tone of the conversation in real-time.
*   **Trend Chart:** An interactive insight panel showing the trajectory of emotional intensity throughout the session.
*   **Pattern Recognition:** Automatically identifies and tags key emotional keywords (e.g., #anxiety, #pressure) to help users identify triggers.

### 3. 🧩 Personalized Coping Strategies
*   **Actionable Advice:** Users can generate a specific, "micro-habit" coping strategy based on their specific emotional history in the current session.
*   **Therapeutic Logic:** The AI acts as a behavioral therapist to suggest quick (under 2 minutes) techniques tailored to the user's state (e.g., sensory grounding for anxiety, physical regulation for anger).

### 4. 🧠 Deep Reflection Mode
*   **Advanced Reasoning:** Users can request a "Deep Reflection" where the AI analyzes the conversation context to identify underlying emotions.
*   **Thinking Capability:** Utilizes `gemini-3-pro-preview` with a dedicated **Thinking Budget** to generate profound, personalized insights rather than generic advice.

### 5. 🔍 Search Grounding
*   **Real-Time Information:** When relevant, the AI can securely search the web using Google Search to provide up-to-date information on mental health resources or scientific concepts.
*   **Transparent Sources:** Citations and source links are displayed directly in the chat to ensure trust.

### 6. 🌬️ Grounding Tools
*   **Interactive Breathing Exercise:** A built-in "Box Breathing" tool (4-4-4-4 technique) to help users physically calm their nervous system.
*   **Visual Guidance:** Soothing animations to guide the breathing rhythm.

### 7. 🚨 Distress Detection & Safety
*   **Guardrails:** The AI is trained to detect signs of self-harm or extreme distress.
*   **Crisis Handling:** Responds with empathy and encourages real-world professional help without being alarmist.

## 🛠️ Technical Architecture

MindShield is built as a lightweight, responsive web application.

*   **Frontend:** React 19, Tailwind CSS, Lucide React Icons.
*   **AI Integration:** Google Gemini API (`@google/genai` SDK).
*   **Voice Input:** Web Speech API (SpeechRecognition).
*   **State Management:** React Hooks (Session-based, non-persistent).

### AI Models Used

| Feature | Model | Reasoning |
| :--- | :--- | :--- |
| **Main Chat, Search & Strategy** | `gemini-3-flash-preview` | Fast latency, high availability. Equipped with `googleSearch` tool for grounding responses in real-world data. |
| **Deep Reflection** | `gemini-3-pro-preview` | High reasoning capability. Configured with `thinkingConfig` to allow "thought" before answering complex emotional queries. |

## 🚀 Getting Started

1.  **Environment Setup:**
    Create a `.env` file in the project root:
    ```
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

2.  **API Key:** This application requires a Google Gemini API Key.

3.  **Run:**
    *   Ensure dependencies are installed.
    *   `npm run dev` to start the development server.

## 🔒 Privacy & Ethics

*   **No Database:** We do not maintain a database of user conversations.
*   **Client-Side Only:** State exists only within the user's browser session.
*   **Transparent Limits:** The UI clearly communicates that this is an AI tool, not a human therapist.

## ⚠️ Important Disclaimer

MindShield is an AI-powered tool for emotional support and self-reflection. **It is not a medical device and does not provide clinical diagnoses or medical advice.**

If you or someone you know is in immediate danger, please contact your local emergency services or a crisis hotline immediately.