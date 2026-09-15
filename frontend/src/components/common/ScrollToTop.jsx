import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop({ targetRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If targetRef is provided, listen to that specific container, otherwise listen to window
    const target = targetRef?.current || window;
    const isWindow = target === window;

    const toggleVisibility = () => {
      const scrollPos = isWindow ? window.scrollY : target.scrollTop;
      if (scrollPos > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    target.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => target.removeEventListener('scroll', toggleVisibility);
  }, [targetRef]);

  const scrollToTop = () => {
    const target = targetRef?.current || window;
    const isWindow = target === window;
    
    if (isWindow) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      target.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className={`fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50 transition-all duration-300 pointer-events-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="pointer-events-auto p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] text-[color:var(--text-muted)] hover:text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:-translate-y-1 transition-all"
        title="Scroll to Top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
