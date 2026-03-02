// Build script for Vercel deployment
// Combines landing page with Docusaurus docs from vivim-app-og

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Docs source: always use external vivim-app-og
const DOCS_BUILD = path.join(ROOT, '..', 'vivim-app-og', 'vivim-app', 'vivim.docs.context', 'build');

// Create dist directory
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

// Copy landing page files to dist
const landingFiles = ['index.html', 'style.css', 'script.js'];
landingFiles.forEach(file => {
  const src = path.join(ROOT, file);
  const dest = path.join(DIST, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  }
});

// Copy assets directory
const assetsSrc = path.join(ROOT, 'assets');
const assetsDest = path.join(DIST, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('Copied assets/ to dist/assets/');
}

// Copy docs build to dist/docs
if (fs.existsSync(DOCS_BUILD)) {
  fs.cpSync(DOCS_BUILD, path.join(DIST, 'docs'), { recursive: true });
  console.log(`Copied docs to dist/docs/ (from vivim-app-og)`);
} else {
  console.log(`Warning: External docs not found at ${DOCS_BUILD}`);
}

console.log('Build complete! Output in dist/');
