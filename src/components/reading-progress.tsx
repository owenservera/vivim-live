"use client";
import { motion, useScroll } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        background: "linear-gradient(90deg, #8B5CF6, #06B6D4, #10B981)",
        scaleX: scrollYProgress,
      }}
    />
  );
}
