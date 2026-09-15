const fs = require('fs');
const path = require('path');

// Run this script to generate latest.json for Tauri updater
// Usage: node scripts/generate_manifest.js <version> <win-sig-path> <linux-sig-path>

const version = process.argv[2] || process.env.GITHUB_REF_NAME || '1.3.14';
const winSigPath = process.argv[3];
const linuxSigPath = process.argv[4];

const manifest = {
  version: version.replace(/^v/, ''),
  notes: "Minor bug fixes and performance improvements.",
  pub_date: new Date().toISOString(),
  platforms: {}
};

try {
  if (winSigPath && fs.existsSync(winSigPath)) {
    const winSig = fs.readFileSync(winSigPath, 'utf8').trim();
    manifest.platforms["windows-x86_64"] = {
      signature: winSig,
      url: `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/${version}/OmnideskBD_${version}_x64_en-US.msi.zip`
    };
  }

  if (linuxSigPath && fs.existsSync(linuxSigPath)) {
    const linuxSig = fs.readFileSync(linuxSigPath, 'utf8').trim();
    manifest.platforms["linux-x86_64"] = {
      signature: linuxSig,
      url: `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/${version}/omnidesk-bd_${version}_amd64.AppImage.tar.gz`
    };
  }

  const outputPath = path.join(__dirname, '..', 'latest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`Successfully generated latest.json at ${outputPath}`);
} catch (error) {
  console.error("Failed to generate manifest:", error);
  process.exit(1);
}
