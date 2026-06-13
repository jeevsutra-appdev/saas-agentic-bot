# Aether AI - Monorepo

Aether AI is a premium, multi-tenant Agentic AI Chatbot SaaS platform built using Next.js 15, React 19, Tailwind CSS v4, and Supabase.

## Project Structure

```
aether-ai/
├── apps/
│   └── web/                   # Next.js 15 Application (React 19)
├── packages/
│   ├── config/                # Shared TSConfig and ESLint Flat config
│   ├── db/                    # Supabase schemas and types wrapper
│   └── ui/                    # Tailwind v4 theme, CSS variables & shared components
├── eslint.config.js           # Root ESLint Flat configuration
├── pnpm-workspace.yaml        # PNPM Workspaces setup
└── package.json               # Root monorepo workspace configurations
```

## Tech Stack & Configurations

- **Core Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 featuring premium dynamic variables & presets (Nimbus, Onyx, Sakura, Kiosk, Concierge)
- **Unit Testing**: Vitest test runner
- **Linter**: ESLint flat config
- **Workspace Tool**: pnpm Workspaces

---

## Getting Started

### Prerequisites

Ensure you have Node.js 22+ and pnpm 11+ installed.

### Installation

To install all dependencies and link workspaces:

```bash
pnpm install
```

### Running Locally

To run the Next.js development server:

```bash
pnpm dev
```

The web client will be active at `http://localhost:3000`.

### Typechecking & Testing

To run the TypeScript type checker across all packages:

```bash
pnpm typecheck
```

To run the unit test suite:

```bash
pnpm test
```

### Production Build

To compile a production optimized package:

```bash
pnpm build
```
