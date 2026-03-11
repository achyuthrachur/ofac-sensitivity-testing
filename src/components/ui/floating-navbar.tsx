"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingNavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

interface FloatingNavProps {
  navItems: FloatingNavItem[];
  className?: string;
  brand?: React.ReactNode;
  cta?: React.ReactNode;
  activeLink?: string;
  persist?: boolean;
}

export function FloatingNav({
  navItems,
  className,
  brand,
  cta,
  activeLink,
  persist = false,
}: FloatingNavProps) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(persist);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (persist) {
      setVisible(true);
      return;
    }

    if (typeof current !== "number") return;

    const previous = scrollYProgress.getPrevious() ?? 0;
    const direction = current - previous;

    if (scrollYProgress.get() < 0.05) {
      setVisible(false);
      return;
    }

    setVisible(direction < 0);
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        className={cn(
          "fixed inset-x-0 top-6 z-[5000] mx-auto flex max-w-fit items-center gap-4 rounded-full border border-white/55 bg-white/85 px-3 py-2 shadow-[0_12px_32px_rgba(1,30,65,0.12)] backdrop-blur-xl",
          className,
        )}
      >
        {brand ? <div className="border-r border-[#d6dde7] pr-4">{brand}</div> : null}
        <div className="flex items-center gap-1">
          {navItems.map((navItem) => (
            <Link
              key={navItem.link}
              href={navItem.link}
              className={cn(
                "relative flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#39516f] transition-colors hover:text-[#011E41]",
                activeLink === navItem.link && "bg-[#011E41] text-white shadow-[0_8px_24px_rgba(1,30,65,0.18)]",
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block">{navItem.name}</span>
            </Link>
          ))}
        </div>
        {cta ? <div className="pl-2">{cta}</div> : null}
      </motion.div>
    </AnimatePresence>
  );
}
