'use client';

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  formatter?: (val: number) => string;
  className?: string;
}

export default function AnimatedCounter({ 
  value, 
  duration = 1000, 
  formatter = (v) => v.toLocaleString(),
  className = "" 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const endValue = value;
    const startValue = count;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * (endValue - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className={className}>{formatter(count)}</span>;
}
