import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface AudioVisualizationProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  isActive,
  isSpeaking,
}) => {
  const [levels, setLevels] = useState([0.2, 0.6, 0.2]);
  const bars = 3;
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (isActive && isSpeaking) {
        setLevels(
          Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8)
        );
      } else {
        setLevels([0.2, 0.3, 0.2]);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking]);

  useEffect(() => {
    console.log("AudioVisualization - isActive:", isActive, "isSpeaking:", isSpeaking);
  }, [isActive, isSpeaking]);

  return (
    <div className="flex items-center justify-center gap-1" aria-hidden="true">
      {levels.map((level, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-500 rounded-full"
          animate={{
            height: isActive ? level * 16 : 8,
            opacity: isActive ? 1 : 0.5,
          }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualization;