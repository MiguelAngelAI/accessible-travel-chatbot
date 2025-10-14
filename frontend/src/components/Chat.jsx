import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function Chat({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 
                 bg-white backdrop-blur-md 
                 shadow-lg rounded-t-2xl 
                 border border-gray-100
                 transition-all duration-300"
    >
      {/* Campo de texto */}
      <motion.input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex-1 rounded-full border border-gray-300 
                   px-4 py-2 text-sm bg-white 
                   text-gray-800 placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
      />

      {/* Botón de enviar */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`p-3 rounded-full shadow-md transition ${
          message.trim()
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!message.trim()}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </form>
  );
}