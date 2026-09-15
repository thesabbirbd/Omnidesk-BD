import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function StreamingMessage({ content, isStreamingEnabled = true }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(isStreamingEnabled);

  useEffect(() => {
    if (!isStreamingEnabled) {
      setDisplayedText(content);
      return;
    }
    
    let currentIndex = 0;
    // Chunk size allows faster perceived rendering for long texts without jumping
    const chunkSize = Math.max(1, Math.floor(content.length / 50)); 
    
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        currentIndex = Math.min(currentIndex + chunkSize, content.length);
        setDisplayedText(content.slice(0, currentIndex));
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [content, isStreamingEnabled]);

  return (
    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--bg-panel)] prose-pre:border prose-pre:border-[var(--border-color)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
      )}
    </div>
  );
}
