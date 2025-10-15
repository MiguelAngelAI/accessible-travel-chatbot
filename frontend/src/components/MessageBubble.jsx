import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";
  const safeText = typeof text === "string" ? text : String(text ?? "");

  return (
    <motion.div
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
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
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Burbuja con Markdown */}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          <div className={isUser ? "text-white" : "text-gray-800"}>
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      isUser
                        ? "underline text-white hover:text-gray-200"
                        : "underline text-blue-600 hover:text-blue-800"
                    }
                  />
                ),
                code: ({ inline, children, ...props }) =>
                  inline ? (
                    <code
                      {...props}
                      className="bg-black/10 px-1 rounded text-[0.85em] font-mono"
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-black/10 p-2 rounded text-[0.85em] font-mono overflow-x-auto">
                      <code {...props}>{children}</code>
                    </pre>
                  ),
              }}
            >
              {safeText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
