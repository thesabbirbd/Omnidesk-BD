import React from 'react';

/**
 * Phase 8: Skeleton System
 * Skeletons use the .skeleton-delay class so they don't flash for fast loads (<400ms).
 */

export const DashboardSkeleton = () => {
  return (
    <div className="skeleton-delay p-4 sm:p-6 lg:p-8 space-y-8 w-full max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-[var(--bg-input)] rounded-lg skeleton-pulse"></div>
        <div className="h-4 w-96 bg-[var(--bg-input)] rounded-lg skeleton-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
        <div className="h-40 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
        <div className="h-40 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
      </div>
      
      <div className="h-64 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
    </div>
  );
};

export const MindMapSkeleton = () => {
  return (
    <div className="skeleton-delay h-full w-full bg-[var(--bg-canvas)] relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-24 h-12 bg-[var(--bg-card)] rounded-full border border-[var(--border-color)] skeleton-pulse shadow-lg"></div>
        <div className="flex gap-12 mt-8">
          <div className="w-32 h-10 bg-[var(--bg-input)] rounded-full skeleton-pulse"></div>
          <div className="w-32 h-10 bg-[var(--bg-input)] rounded-full skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const StudySpaceSkeleton = () => {
  return (
    <div className="skeleton-delay p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-6 w-1/3 bg-[var(--bg-input)] rounded-lg skeleton-pulse"></div>
      <div className="space-y-3">
        <div className="h-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
        <div className="h-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
        <div className="h-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] skeleton-pulse"></div>
      </div>
    </div>
  );
};
