const fs = require('fs');
const path = require('path');

// Usage: node scripts/generate_manifest.js <version> <artifacts-dir>

const versionRaw = process.argv[2] || process.env.GITHUB_REF_NAME || '1.3.24';
const version = versionRaw.replace(/^v/, '');
const artifactsDir = process.argv[3] || '.';

const manifest = {
  version: version,
  notes: "Security and stability updates.",
  pub_date: new Date().toISOString(),
  platforms: {
    "linux-x86_64": {
      signature: "",
      url: `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/v${version}/Omnidesk-BD-v${version}-linux-x64.AppImage.tar.gz`
    },
    "windows-x86_64": {
      signature: "",
      url: `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/v${version}/Omnidesk-BD-v${version}-windows-x64-setup.exe.zip`
    }
  }
};

try {
  // Find signatures in artifacts dir
  const files = fs.readdirSync(artifactsDir);
  
  const winSigFile = files.find(f => f.includes('windows') && f.endsWith('.zip.sig') || f.endsWith('.tar.gz.sig'));
  const linuxSigFile = files.find(f => f.includes('linux') && f.endsWith('.zip.sig') || f.endsWith('.tar.gz.sig'));

  if (winSigFile) {
    manifest.platforms["windows-x86_64"].signature = fs.readFileSync(path.join(artifactsDir, winSigFile), 'utf8').trim();
    // Tauri updater expects the updater bundle format, which is .zip for Windows and .tar.gz for Linux
    manifest.platforms["windows-x86_64"].url = `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/v${version}/${winSigFile.replace('.sig', '')}`;
  }

  if (linuxSigFile) {
    manifest.platforms["linux-x86_64"].signature = fs.readFileSync(path.join(artifactsDir, linuxSigFile), 'utf8').trim();
    manifest.platforms["linux-x86_64"].url = `https://github.com/thesabbirbd/Omnidesk-BD/releases/download/v${version}/${linuxSigFile.replace('.sig', '')}`;
  }

  const outputPath = path.join(__dirname, '..', 'latest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`Successfully generated latest.json at ${outputPath}`);
} catch (error) {
  console.error("Failed to generate manifest:", error);
  process.exit(1);
}
