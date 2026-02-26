# Contributing to VIVIM

Welcome to VIVIM! We're excited that you're interested in contributing. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Recognition](#recognition)

## Code of Conduct

By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Repository Structure

```
vivim-live/
├── docs/                   # Docusaurus documentation
│   ├── docs/              # Documentation source
│   └── docusaurus.config.ts
├── github-frontend/       # Next.js 15 frontend
├── index.html             # Landing page
├── style.css              # Landing page styles
├── script.js              # Landing page scripts
└── package.json           # Root package.json
```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/owenservera/vivim-live
cd vivim-live

# Install dependencies
bun run install:all

# Run development servers
bun run dev

# Build for production
bun run build
```

## Development Setup

### Prerequisites

- **Node.js**: 18+ or Bun 1.0+
- **Git**: Latest version
- **Bun**: Recommended (or npm/yarn/pnpm)

### Running Locally

```bash
# Run everything
bun run dev

# Or run individually
bun run dev:docs      # Docs at localhost:3001
bun run dev:web       # Frontend at localhost:3000

# Build
bun run build         # Everything
bun run build:docs   # Docs only
bun run build:web    # Frontend only
```

## Making Changes

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vivim-live
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/my-awesome-feature
   # or
   git checkout -b fix/some-bug-fix
   ```

## Submitting Changes

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add OAuth2 login support
fix(memory): resolve memory leak in P2P sync
docs(readme): update installation instructions
refactor(api): simplify authentication flow
```

### Pull Request Guidelines

1. **Keep PRs small** - One feature or fix per PR
2. **Write descriptive titles** - Start with type: description
3. **Fill out the template** - Include all requested information
4. **Link issues** - Use `Closes #123` or `Related to #456`
5. **Update documentation** - If you change functionality, update docs

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated
- [ ] No new warnings
- [ ] All checks pass

## Coding Standards

### General

- Use meaningful variable names
- Keep functions small and focused
- Comment complex logic
- Write tests for new features

### JavaScript/TypeScript

- Use ES6+ features
- Prefer `const` over `let`
- Use arrow functions where appropriate
- Use template literals over string concatenation

### CSS

- Follow existing naming conventions
- Use CSS variables for theming
- Keep selectors simple
- Mobile-first responsive design

### React/Next.js

- Use functional components with hooks
- Follow React hooks rules
- Use TypeScript for type safety
- Keep components modular

## Testing

### Running Tests

```bash
# When tests are configured
bun test
```

### Writing Tests

- Test behavior, not implementation
- Cover edge cases
- Keep tests independent

## Documentation

### Updating Docs

```bash
# Run docs locally
cd docs
bun run dev
```

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes

### Doc Structure

```
docs/
├── docs/              # Your docs here
│   ├── getting-started/
│   ├── guides/
│   └── api/
├── src/               # Custom components
└── docusaurus.config.ts
```

## Recognition

Contributors will be recognized in:

- README.md contributors section
- GitHub release notes
- Discord announcements

---

**Thank you for contributing to VIVIM!** 🚀
