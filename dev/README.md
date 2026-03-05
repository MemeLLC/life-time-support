# Life Time Support - Dev

pnpm monorepo for Life Time Support web applications. All apps are deployed on Cloudflare (Pages / Workers).

## Tech Stack

- **Package manager**: pnpm (workspaces)
- **Build orchestration**: Turborepo
- **Language**: TypeScript
- **Linter / Formatter**: ESLint + Prettier
- **Runtime**: Cloudflare Workers / Pages
- **Deploy**: `wrangler` CLI (GitHub Actions planned)

## Project Structure

```
dev/
├── apps/
│   ├── landing-page/   # Astro + React LP         → lp.life-time-support.com
│   ├── line/           # Astro + React gated content → members.life-time-support.com
│   └── mail-server/    # Hono email worker         → forms.life-time-support.com
├── packages/
│   ├── components/     # Shared React components & hooks
│   └── types/          # Shared types & Zod schemas
├── turbo.json          # Turborepo task config
├── pnpm-workspace.yaml # Workspace definition
├── eslint.config.mjs   # Shared ESLint config
├── .prettierrc         # Prettier config
└── package.json        # Root scripts & devDependencies
```

## Apps

### `@life-time-support/landing-page`

Astro + React landing page deployed to Cloudflare Pages.

- UI: Tailwind CSS v4, Radix UI, Lucide icons, shadcn/ui components
- Forms: React Hook Form + Zod validation
- Testing: Vitest + Testing Library (unit), Playwright (E2E), Lighthouse CI

### `@life-time-support/line`

Astro + React gated content pages for opted-in leads. Deployed to Cloudflare Pages.

- UI: Tailwind CSS v4, Radix UI, Lucide icons

### `@life-time-support/mail-server`

Hono API on Cloudflare Workers for email handling.

- Email: Resend SDK + React Email templates
- API: Hono with Zod OpenAPI validation, Swagger UI
- Testing: Vitest

## Packages

### `@life-time-support/components`

Shared React components and hooks used across apps.

- Turnstile (CAPTCHA), Contact form, session storage / media query / in-view / location hooks

### `@life-time-support/types`

Shared TypeScript types and Zod schemas.

- Contact, Contact Details, Problem Details schemas

## Scripts

```bash
pnpm dev            # Start all apps in dev mode
pnpm build          # Build all apps
pnpm test           # Run tests (cached)
pnpm test:run       # Run tests once
pnpm lint           # Lint all packages
pnpm lint:fix       # Lint and auto-fix
pnpm format         # Format all files with Prettier
pnpm format:check   # Check formatting
pnpm typecheck      # Type-check all packages
```

## Deploy

Each app is deployed individually via `wrangler`:

```bash
cd apps/landing-page && pnpm deploy
cd apps/line && pnpm deploy
cd apps/mail-server && pnpm deploy
```
