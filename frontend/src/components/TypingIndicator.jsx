import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flex justify-start pl-12 mt-1 mb-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-2 shadow-sm">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
