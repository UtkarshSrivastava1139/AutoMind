"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 800,
  className = "",
  threshold = 0.05,
}: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if window is available (SSR protection)
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { 
        threshold,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before element enters fully
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  // Determine starting offset transforms
  const getTransform = () => {
    if (isIntersecting) return "translate(0, 0) scale(1)";
    
    switch (direction) {
      case "up":
        return "translateY(24px) scale(0.98)";
      case "down":
        return "translateY(-24px) scale(0.98)";
      case "left":
        return "translateX(24px) scale(0.98)";
      case "right":
        return "translateX(-24px) scale(0.98)";
      case "none":
      default:
        return "none";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Premium cubic bezier ease-out
        willChange: "opacity, transform" // Direct GPU hardware acceleration hint
      }}
    >
      {children}
    </div>
  );
}
