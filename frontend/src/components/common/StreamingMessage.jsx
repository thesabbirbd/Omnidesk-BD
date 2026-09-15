import React, { useState, useEffect } from 'react';

export default function StreamingMessage({ content, isStreamingEnabled = true }) {
  const [displayedText, setDisplayedText] = useState(isStreamingEnabled ? '' : content);
  const [isStreaming, setIsStreaming] = useState(isStreamingEnabled);

  useEffect(() => {
    if (!isStreamingEnabled) {
      setDisplayedText(content);
      setIsStreaming(false);
      return;
    }

    setDisplayedText('');
    setIsStreaming(true);
    let currentIndex = 0;
    const chunkSize = Math.max(2, Math.floor(content.length / 60));

    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        currentIndex = Math.min(currentIndex + chunkSize, content.length);
        setDisplayedText(content.slice(0, currentIndex));
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [content, isStreamingEnabled]);

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
        dangerouslySetInnerHTML={{ __html: renderMarkdown(displayedText) }}
        className="[&>p]:mb-1 [&>p:last-child]:mb-0"
      />
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-cyan-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
}
