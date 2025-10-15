import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function Chat({ messages = [], onSend, isTyping }) {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    onSend(message);
    setMessage("");
  };

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensajes */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 py-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            Start a conversation to explore accessibility insights 🌍
          </p>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} sender={msg.sender} text={msg.text} />
          ))
        )}

        {/* 👇 Indicador dentro del área de mensajes, al final */}
        {isTyping && (
          <div className="flex justify-start mt-2 ml-10">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Barra de entrada */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 p-4 bg-white backdrop-blur-md shadow-lg border-t border-gray-100 transition-all duration-300"
      >
        <motion.input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`p-3 rounded-full shadow-md transition ${
            message.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
}
