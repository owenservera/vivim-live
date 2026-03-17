import { serve } from 'bun';

const port = 3000;
const host = 'localhost';

// File types to serve with correct MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp'
};

// Simple static file server using Bun
Bun.serve({
  port,
  hostname: host,
  async fetch(req) {
    const url = new URL(req.url);

    // Default to index.html for root path
    let filePath = url.pathname;
    if (filePath === '/') {
      filePath = '/index.html';
    }

    // Remove leading slash and construct file path
    const file = Bun.file('.' + filePath);

    try {
      // Try to read the file
      const fileExists = await file.exists();

      if (!fileExists) {
        // Return 404 for non-existent files
        return new Response('404 Not Found', { status: 404 });
      }

      // Get file extension for MIME type
      const ext = filePath.slice(filePath.lastIndexOf('.'));
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Serve the file with correct MIME type
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache' // Disable cache for development
        }
      });
    } catch (error) {
      console.error(`Error serving ${filePath}:`, error);
      return new Response('500 Internal Server Error', { status: 500 });
    }
  }
});

console.log(`🚀 VIVIM Live dev server running at http://${host}:${port}`);
console.log(`📁 Serving files from: ${process.cwd()}`);
console.log(`\n💡 Tips:`);
console.log(`   - Open http://localhost:${port} in your browser`);
console.log(`   - Files will auto-reload when saved`);
