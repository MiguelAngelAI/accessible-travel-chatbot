import { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import { motion } from "framer-motion";
import { Globe2, Zap, Database } from "lucide-react";

// Detecta modo desde variable de entorno
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I’m your accessible travel assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🔁 Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (message) => {
    const newMessages = [...messages, { sender: "user", text: message }];
    setMessages(newMessages);
    setLoading(true);

    if (USE_MOCK) {
      // 🧱 MOCK MODE
      setTimeout(() => {
        const botReply = simulateBotReply(message);
        setMessages([...newMessages, { sender: "bot", text: botReply }]);
        setLoading(false);
      }, 1000);
    } else {
      // ⚡ LIVE MODE
      try {
        const evtSource = new EventSource(
          `http://127.0.0.1:8000/chat?message=${encodeURIComponent(message)}`
        );

        let botReply = "";

        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "content") {
            botReply += data.content;
            setMessages([...newMessages, { sender: "bot", text: botReply }]);
          } else if (data.type === "done") {
            evtSource.close();
            setLoading(false);
          }
        };

        evtSource.onerror = (err) => {
          console.error("SSE connection error:", err);
          evtSource.close();
          setLoading(false);
        };
      } catch (error) {
        console.error("Error connecting to backend:", error);
        setMessages([
          ...newMessages,
          {
            sender: "bot",
            text: "⚠️ Could not reach the backend. Please ensure it's running on port 8000.",
          },
        ]);
        setLoading(false);
      }
    }
  };

  const resetChat = () =>
    setMessages([
      {
        sender: "bot",
        text: "👋 Hello! I’m your accessible travel assistant. How can I help you today?",
      },
    ]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 relative overflow-hidden">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 shadow-lg flex justify-center items-center gap-3-transition-all duration-700 ease-in-out">
        <Globe2 className="w-6 h-6" />
        <h1 className="font-semibold text-lg tracking-wide">
          Accessible Travel Chatbot
        </h1>
        <span
          className={`text-xs ml-2 px-2 py-1 rounded-full ${
            USE_MOCK
              ? "bg-yellow-400 text-black"
              : "bg-green-400 text-gray-900"
          }`}
        >
          {USE_MOCK ? "Mock Mode" : "Live Mode"}
        </span>
      </header>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col flex-1 w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl mt-6 mb-6 overflow-hidden border border-gray-200"
      >
        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50 custom-scrollbar">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <MessageBubble sender={m.sender} text={m.text} />
            </motion.div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </main>

        {/* Chat input and reset */}
        <div className="bg-white">
          <Chat onSend={sendMessage} />
          <button
            onClick={resetChat}
            className="text-xs text-gray-400 underline w-full py-1 hover:text-gray-600 transition"
          >
            Reset Chat
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-gray-600 text-xs pb-2">
        Built with <Zap className="inline w-4 h-4 text-yellow-400" /> FastAPI +{" "}
        <Database className="inline w-4 h-4 text-blue-600" /> OpenAI
      </footer>
    </div>
  );
}

// ========== MOCK REPLIES ==========
function simulateBotReply(message) {
  if (message.toLowerCase().includes("hello"))
    return "Hello! How can I help you with accessible travel today?";
  if (message.toLowerCase().includes("ada"))
    return "The ADA is a U.S. law ensuring accessibility and equal rights for people with disabilities.";
  if (message.toLowerCase().includes("aca"))
    return "Canada enforces accessibility through the ACA (Accessible Canada Act) and provincial regulations like AODA.";
  return "This is a simulated AI response for offline mode 🧠";
}