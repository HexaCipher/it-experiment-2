"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Users,
  Globe,
} from "lucide-react";

const cornerIcons = [
  { Icon: Globe, label: "Access Control", color: "text-amber-400", position: "top-20 left-20 lg:top-28 lg:left-28" },
  { Icon: Users, label: "RBAC", color: "text-violet-400", position: "top-20 right-20 lg:top-28 lg:right-28" },
  { Icon: FileCheck, label: "Validation", color: "text-emerald-400", position: "bottom-20 right-20 lg:bottom-28 lg:right-28" },
  { Icon: Lock, label: "HTTPS", color: "text-blue-400", position: "bottom-20 left-20 lg:bottom-28 lg:left-28" },
];

export function SecurityShieldAnimation() {
  return (
    <div className="relative flex items-center justify-center w-full h-105 lg:h-130">
      {/* Background blob */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 lg:w-96 lg:h-96 bg-primary/5 dark:bg-primary/10 animate-blob opacity-60" />
      </div>

      {/* Outer pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/10 dark:border-primary/20"
          style={{
            width: `${160 + i * 80}px`,
            height: `${160 + i * 80}px`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Orbit track (visible ring) */}
      <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-dashed border-primary/15 dark:border-primary/25" />

      {/* Corner icons with subtle shake */}
      {cornerIcons.map(({ Icon, label, color, position }, index) => (
        <motion.div
          key={label}
          className={`absolute ${position}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.15, duration: 0.5, type: "spring" }}
        >
          <motion.div
            animate={{
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 1, -1, 2, -2, 0],
              rotate: [0, -2, 2, -1, 1, 0],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-background border border-border shadow-lg ${color}`}>
                <Icon className="size-5 lg:size-6" />
              </div>
              <span className="text-[10px] lg:text-xs font-medium text-muted-foreground whitespace-nowrap">
                {label}
              </span>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Center shield */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 150 }}
      >
        {/* Glow ring */}
        <div className="absolute w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-primary/10 dark:bg-primary/20 animate-pulse-ring" />

        {/* Shield container */}
        <motion.div
          className="relative flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-primary/90 to-primary shadow-2xl shadow-primary/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldCheck className="size-12 lg:size-16 text-primary-foreground" strokeWidth={1.5} />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1.5 h-1.5 rounded-full bg-primary/20 dark:bg-primary/40 ${i % 2 === 0 ? "animate-float" : "animate-float-reverse"}`}
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
