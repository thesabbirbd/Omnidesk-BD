#!/bin/bash
pages=("Dashboard" "StudyPlan" "Topics" "Materials" "Projects" "Timer" "Notes" "Analytics" "Ai" "Settings")

for page in "${pages[@]}"
do
  cat << INNER_EOF > src/pages/${page}.jsx
import React from 'react';

export default function ${page}() {
  return (
    <div className="flex items-center justify-center h-full border border-[#1e293b] rounded-2xl bg-[#0a0f1d] neumorphic-panel">
      <h1 className="text-2xl font-semibold text-slate-400 border-b border-[#1e293b] pb-2">
        ${page} Page
      </h1>
    </div>
  );
}
INNER_EOF
done
