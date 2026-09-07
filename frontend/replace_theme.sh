#!/bin/bash
find src -type f -name "*.jsx" -exec sed -i 's/#0f172a/var(--bg-card)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#0a0f1d/var(--bg-panel)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#070b14/var(--bg-canvas)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#131c31/var(--bg-input)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#1e293b/var(--border-color)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#090e1a/var(--shadow-dark)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/#15203a/var(--shadow-light)/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/text-slate-200/text-[color:var(--text-main)]/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/text-slate-100/text-[color:var(--text-main)]/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/text-slate-400/text-[color:var(--text-muted)]/g' {} +
find src -type f -name "*.jsx" -exec sed -i 's/text-slate-300/text-[color:var(--text-muted)]/g' {} +
