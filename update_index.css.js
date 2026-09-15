const fs = require('fs');
const file = 'frontend/src/index.css';
let css = fs.readFileSync(file, 'utf8');

const globalButtonCSS = `
/* Phase 2: Every Button Audit - Global Button Standardization */
button, 
[role="button"] {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-main)] focus:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer;
}
button:active:not(:disabled),
[role="button"]:active:not(:disabled) {
  @apply scale-95;
}
`;

css = css.replace(/@layer components \{/, `@layer components {\n${globalButtonCSS}\n`);
fs.writeFileSync(file, css);
