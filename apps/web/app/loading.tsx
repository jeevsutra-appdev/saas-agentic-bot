"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03040b]/90 backdrop-blur-2xl">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute w-28 h-28 rounded-full border-[2px] border-t-indigo-500/80 border-r-purple-500/40 border-b-transparent border-l-transparent opacity-80 blur-[1px]"
        />
        
        {/* Inner fast ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-16 h-16 rounded-full border-[3px] border-t-cyan-400 border-l-blue-500/80 border-r-transparent border-b-transparent"
        />

        {/* Center pulsing core */}
        <motion.div
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-300 shadow-[0_0_30px_rgba(99,102,241,1)]"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute mt-40 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 uppercase">
          Initializing Engine
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-1 h-1 rounded-full bg-indigo-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
