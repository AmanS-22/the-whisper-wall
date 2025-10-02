"use client";

import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { ReactNode } from "react";

interface Button3dProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button3d({ children, onClick, className }: Button3dProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-black rounded-lg shadow-lg transition-all duration-200",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-gray-700 before:to-gray-900 before:rounded-lg before:transform before:translate-y-1 before:-z-10",
        "hover:before:translate-y-0.5 active:before:translate-y-0",
        className
      )}
    >
      {children}
    </motion.button>
  );
}