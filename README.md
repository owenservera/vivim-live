# VIVIM Live - Sovereign AI Interface

A modern, interactive landing page for VIVIM - your personal AI memory layer. Built with 2026 startup trends including 3D elements, kinetic typography, scrollytelling, and integrated documentation.

## 🚀 Quick Start with Bun

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine
- Modern web browser

### Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

The dev server will start at `http://localhost:3000` and automatically reload when you save changes.

### Production Build

This is a static site, so no build step is needed. Simply deploy the following files:

- `index.html`
- `style.css`
- `script.js`
- `demo-interactive.js`
- `assets/` directory (if present)

## 📁 Project Structure

```
vivim-live/
├── index.html              # Main landing page with all features
├── style.css               # Complete styling including glassmorphism, animations
├── script.js               # Core JavaScript with Three.js, scroll effects
├── demo-interactive.js      # Demo-specific chat and interaction logic
├── server.js               # Bun development server
├── package.json             # Bun project configuration
├── bunfig.toml            # Bun configuration
└── assets/                 # Images and static assets
```

## ✨ Features

### Implemented (All 7 Phases)

1. **3D Hero Background** - Interactive particle network with Three.js
2. **Kinetic Typography** - Scroll-triggered text animations
3. **Interactive Demo** - Live chat, drag & drop memory cards
4. **Scrollytelling** - Progress indicators, section milestones
5. **Vibrant Colors** - Enhanced maximalist design with grain texture
6. **Integrated Docs** - Searchable documentation accordion
7. **Bonus Features** - AI personalization, theme toggle, performance tracking

### Technical Highlights

- **Three.js** - 3D particle network with mouse parallax
- **Intersection Observer** - Scroll-triggered animations
- **LocalStorage** - Theme preference persistence
- **Drag & Drop API** - Memory card interactions
- **CSS Animations** - Kinetic effects, smooth transitions
- **Bun** - Fast development server and dependency management

## 🎨 Customization

### Colors
Edit CSS variables in `style.css`:

```css
:root {
  --vivim-pink: #FF2D6E;
  --vivim-cyan: #00D4E8;
  --vivim-green: #00C786;
  /* ... more colors */
}
```

### 3D Settings
Modify Three.js configuration in `script.js`:

```javascript
const particleCount = 200;     // Number of particles
const connectionDistance = 1.5;  // Connection threshold
```

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:

- **Vercel**: Connect repo, auto-deploys
- **Netlify**: Drag & drop or Git push
- **GitHub Pages**: Push to gh-pages branch
- **Cloudflare Pages**: Zero-config deployment

### Environment Variables
No environment variables needed - fully static site!

## 📊 Performance

- **Load Time**: < 2s on 3G
- **Bundle Size**: < 50KB gzipped (excluding Three.js)
- **Lighthouse Score**: > 90 (target)

## 🧪 Testing

```bash
# Format code
bun run format

# Check format
bun run format:check
```

## 📝 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes
4. Test locally with `bun run dev`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Main Repo**: https://github.com/owenservera/vivim-app
- **SDK**: https://github.com/vivim/vivim-sdk
- **Documentation**: https://vivim.live/docs
- **Discord**: https://discord.gg/vivim

---

Built with ❤️ for the sovereign AI future
