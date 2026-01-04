import { useEffect, useState, useRef } from 'react';

export default function StatCard({ label, value, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          // Simple count-up logic
          const duration = 2000; // 2 seconds
          const steps = 60;
          const stepValue = value / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
              setCount(Math.min(Math.floor(stepValue * currentStep), value));
            } else {
              clearInterval(timer);
              setCount(value);
            }
          }, duration / steps);

          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div 
      ref={elementRef}
      className="flex flex-col items-center justify-center p-6 text-center group"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e93b92] to-[#FFC107] bg-clip-text text-transparent mb-2 font-['Bagel_Fat_One']">
        {count}{suffix}
      </div>
      <p className="text-gray-400 font-bold tracking-wide uppercase text-sm md:text-base">
        {label}
      </p>
    </div>
  );
}
