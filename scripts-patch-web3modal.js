// Patches web3modal v2.7.1 EIP-6963 null-provider crash (installedInjectedWallets).
// Applied automatically after npm install. Remove when upgrading to Reown AppKit.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'node_modules/@web3modal/ui/dist/index.js');
try {
  let src = fs.readFileSync(file, 'utf8');
  const needle = 'injected:r})=>Boolean(r.some(e=>';
  const fixed = 'injected:r})=>Boolean(Array.isArray(r)&&r.some(e=>';
  if (src.includes(needle)) {
    fs.writeFileSync(file, src.replace(needle, fixed));
    console.log('[patch-web3modal] patched installedInjectedWallets null guard');
  } else if (src.includes('Array.isArray(r)&&r.some')) {
    console.log('[patch-web3modal] already patched');
  } else {
    console.log('[patch-web3modal] pattern not found (package changed?)');
  }
} catch (e) {
  console.log('[patch-web3modal] skipped:', e.message);
}
