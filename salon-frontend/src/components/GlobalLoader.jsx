import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181b]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-12 h-12 text-[#d32f2f] animate-spin" />
        <span className="text-[#a3a3a3] font-medium tracking-widest uppercase text-sm">
          Loading...
        </span>
      </motion.div>
    </div>
  );
};

export default GlobalLoader;
