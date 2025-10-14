import { motion } from "framer-motion";

export default function TypingIndicator() {
  const dotVariants = {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-3 mb-4">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-gray-400"
          variants={dotVariants}
          animate="animate"
          transition={{ delay }}
        />
      ))}
    </div>
  );
}
