import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <motion.div
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Contenedor de mensaje con ícono */}
      <div
        className={`flex items-end gap-2 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Ícono */}
        <div
          className={`p-2 rounded-full shadow-sm ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Burbuja */}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-md transition-all ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {text}
        </div>
      </div>
    </motion.div>
  );
}
