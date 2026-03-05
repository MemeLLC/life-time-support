# Instructions for Life Time Support Applications

## Project Overview

**life-time-support** is a pnpm monorepo deployed on Cloudflare. All apps are Cloudflare Pages/Workers.

## Project Structure

```
.github/          # GitHub Actions workflows (planned)
apps/
  homepage/       # Homepage (planned) (Cloudflare Pages)         life-time-support.com (Cloudflare Pages)
  landing-page/   # Astro + React landing page (Cloudflare Pages) lp.life-time-support.com
  line/           # Astro + React gated content for opted-in leads (Cloudflare Pages) members.life-time-support.com
  mail-server/    # Hono email worker (Cloudflare Workers)        forms.life-time-support.com
packages/         # Shared packages
  components/     # Shared React components and hooks
  types/          # Shared types and schemas (zod)
.agents/skills/   # Agent skill definitions (symlinked to .claude/skills/)
```

- **Package manager**: pnpm (workspace defined in `pnpm-workspace.yaml`)
- **Runtime**: Cloudflare Workers / Pages
- **Deploy**: Currently via local `wrangler` CLI. Plan to migrate to GitHub Actions.
- **CI/CD (planned)**:
  - Auto-deploy via GitHub Actions (push to main → detect changed apps → wrangler deploy)
  - Lighthouse CI for post-deploy performance monitoring
  - Image sync from Google Drive to R2 (approach TBD, may change)

## Skills Reference

**IMPORTANT**: You MUST consult the relevant skill(s) before performing any related task. Skills contain critical patterns, gotchas, and best practices that prevent common mistakes. Never skip skill consultation.

| Skill | Path | Use When |
|-------|------|----------|
| **cloudflare** | `.agents/skills/cloudflare/` | Working with any Cloudflare service: Workers, Pages, KV, D1, R2, Durable Objects, Queues, AI, security, networking |
| **wrangler** | `.agents/skills/wrangler/` | Deploying, developing, or configuring Workers/Pages; managing bindings (KV, R2, D1, etc.) |
| **hono** | `.agents/skills/hono/` | Developing Hono applications (mail-server uses Hono) |
| **resend** | `.agents/skills/resend/` | Sending or receiving email via Resend API; has sub-skills for send, inbound, and AI agent inbox |
| **react-email** | `.agents/skills/react-email/` | Building HTML email templates with React components |
| **email-best-practices** | `.agents/skills/email-best-practices/` | Email deliverability, SPF/DKIM/DMARC setup, spam issues, CAN-SPAM/GDPR/CASL compliance |
| **frontend-design** | `.agents/skills/frontend-design/` | Building web UI: pages, components, dashboards, landing pages |
| **vercel-react-best-practices** | `.agents/skills/vercel-react-best-practices/` | Writing, reviewing, or refactoring React/Next.js code with performance-focused best practices |
| **seo-audit** | `.agents/skills/seo-audit/` | Auditing technical SEO, meta tags, performance, organic search |
| **programmatic-seo** | `.agents/skills/programmatic-seo/` | Creating template-based SEO pages at scale (location, comparison, directory pages) |
| **schema-markup** | `.agents/skills/schema-markup/` | Adding JSON-LD structured data, schema.org markup, rich snippets |
| **page-cro** | `.agents/skills/page-cro/` | Conversion rate optimization for landing pages, pricing pages, CTAs |
| **webapp-testing** | `.agents/skills/webapp-testing/` | Testing web apps with Playwright, capturing screenshots, debugging UI |
| **skill-creator** | `.agents/skills/skill-creator/` | Creating or updating agent skills |
