import React from 'react';

export default function Tooltip({ children, text, position = 'bottom' }) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div 
        className={`absolute z-50 whitespace-nowrap px-2 py-1 bg-slate-900 border border-[var(--border-color)] text-cyan-50 text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-lg ${positionClasses[position]}`}
      >
        {text}
      </div>
    </div>
  );
}
