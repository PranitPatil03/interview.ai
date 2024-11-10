import { motion } from "framer-motion";

const AudioVisualization = ({ isActive = true, isSpeaking = false }) => {
  const bars = 3;

  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-500 rounded-full"
          initial={{ height: 8 }}
          animate={{ 
            height: isActive && isSpeaking ? [8, 16, 8] : 8,
            opacity: isActive ? 1 : 0.5
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualization; 