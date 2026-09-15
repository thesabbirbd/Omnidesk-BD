import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * WikipediaTooltip - Shows a tooltip with the Wikipedia summary for a given term.
 *
 * Props:
 *   term: string – the term to look up on Wikipedia.
 *   children: ReactNode – the element that triggers the tooltip on hover.
 */
export default function WikipediaTooltip({ term, children }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce timer reference
  let debounceTimer = null;

  const fetchSummary = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
      );
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();
      setContent(data.extract || 'No summary available.');
    } catch (e) {
      setError('Definition not found');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setShow(true);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSummary(term), 300);
  };

  const handleMouseLeave = () => {
    setShow(false);
    clearTimeout(debounceTimer);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className="absolute z-20 w-64 max-w-xs p-3 rounded-xl bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] left-0 top-full mt-1">
          {loading && <span className="animate-pulse">Loading…</span>}
          {error && <span className="text-rose-400">{error}</span>}
          {content && <p className="whitespace-pre-line">{content}</p>}
          <button
            onClick={() => setShow(false)}
            className="absolute -top-2 -right-2 p-1 text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </span>
  );
}
