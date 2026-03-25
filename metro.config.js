const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix: framer-motion (peer dep of motion/dialkit) has a "module" field
// pointing to dist/es/index.mjs which Metro can't resolve due to its
// InvalidPackageError validation. Patch it on startup to fall back to CJS.
const fmPkgPath = path.resolve(__dirname, 'node_modules/framer-motion/package.json');
try {
  const raw = fs.readFileSync(fmPkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  if (pkg.module) {
    delete pkg.module;
    fs.writeFileSync(fmPkgPath, JSON.stringify(pkg, null, 2));
  }
} catch (e) {
  // framer-motion not installed — skip
}

module.exports = config;
