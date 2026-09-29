import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function StreamingMessage({ content = '', isStreamingEnabled = true }) {
  const safeContent = content || '';
  const [displayedText, setDisplayedText] = useState(isStreamingEnabled ? '' : safeContent);
  const [isStreaming, setIsStreaming] = useState(isStreamingEnabled);

  useEffect(() => {
    if (!isStreamingEnabled) {
      setDisplayedText(safeContent);
      setIsStreaming(false);
      return;
    }

    setDisplayedText('');
    setIsStreaming(true);
    let currentIndex = 0;
    const chunkSize = Math.max(2, Math.floor(safeContent.length / 60));

    const interval = setInterval(() => {
      if (currentIndex < safeContent.length) {
        currentIndex = Math.min(currentIndex + chunkSize, safeContent.length);
        setDisplayedText(safeContent.slice(0, currentIndex));
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [safeContent, isStreamingEnabled]);

  // Simple inline markdown renderer (no external deps)
  const renderMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Inline code
        line = line.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 text-xs font-mono">$1</code>');
        // Bullet points
        if (line.match(/^[•\-\*] /)) {
          line = `<span class="flex gap-2"><span class="text-cyan-400 mt-1 shrink-0">•</span><span>${line.slice(2)}</span></span>`;
        }
        return `<p key="${i}" class="mb-1 last:mb-0">${line || '&nbsp;'}</p>`;
      })
      .join('');
  };

  return (
    <div className="text-sm leading-relaxed font-sans w-full">
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(displayedText)) }}
        className="[&>p]:mb-1 [&>p:last-child]:mb-0"
      />
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
}
