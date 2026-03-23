# VIVIM

> Sovereign, Portable, Personal AI Memory

The living memory layer for your AI — works with all providers.

## Philosophy

VIVIM isn't just technology — it's a philosophy about who owns your AI memory.

- **Sovereign** — You own your memory data completely
- **Portable** — Export your memory anytime in standard formats
- **Personal** — Your memory is yours alone

[vivim.live](https://vivim.live) | [GitHub](https://github.com/owenservera/vivim-live)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Animations**: Framer Motion
- **Components**: shadcn/ui (Radix UI)
- **Runtime**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Node.js 18+ (if not using Bun)

### Installation

```bash
# Clone the repository
git clone https://github.com/owenservera/vivim-live.git
cd vivim-live

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles + glassmorphism
│   └── demos/
│       ├── live-memory/   # Interactive memory demo
│       └── context-engine/ # Context assembly demo
└── components/
    ├── navbar.tsx         # Floating navigation
    ├── neural-bg.tsx      # Canvas particle background
    ├── hero-visual.tsx    # SVG brain visualization
    └── ui/                # shadcn/ui components
```

## Features

- **Glassmorphism Design** — Modern frosted glass aesthetic
- **Interactive Demos** — Live memory extraction and context assembly
- **Responsive** — Mobile-first design
- **Dark Theme** — Optimized for dark mode
- **SEO Optimized** — Meta tags, Open Graph, Twitter Cards

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type check |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add custom domain: `vivim.live`
4. Deploy!

The project is pre-configured for Vercel with:
- Optimized build settings
- Edge caching headers
- Security headers

### Manual Build

```bash
bun install
bun run build
bun run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

AGPL-3.0 — see [LICENSE](LICENSE) for details.

---

**Your memory. Your rules. Everywhere.**
