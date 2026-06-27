# Repository Guidelines

## Project Structure & Module Organization

OneMoreGood is a Next.js App Router project. Route files, layouts, API handlers, and server actions live in `app/`; shared UI is in `components/`, with feature folders such as `components/Admin`, `components/Shop`, and `components/Home`. Reusable server/client helpers live in `lib/`, product seed and hooks in `data/`, shared types in `types/`, and setup notes in `docs/`. Public media assets belong in `public/`, database schema in `supabase/schema.sql`, and one-off utilities in `scripts/`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build and run Next.js type/build checks.
- `npm run start`: serve the production build locally after `npm run build`.
- `npm run lint`: run ESLint with Next.js core web vitals and TypeScript rules.
- `npm run test:email`: send/render the email test script using `.env.local`.

Run `npm install` after pulling dependency changes.

## Coding Style & Naming Conventions

Use TypeScript for application code and React components. Follow the existing style: two-space indentation, double quotes, semicolons generally omitted, and path aliases via `@/*` when importing across folders. Name React components in PascalCase (`StockManager.tsx`), hooks with `use` prefixes (`useStock.ts`), route handlers as `route.ts`, and server actions as `actions.ts`. Keep feature-specific CSS close to the feature, as with `components/Home/home.css`.

## Testing Guidelines

There is no full automated test suite yet. For now, validate changes with `npm run lint` and `npm run build`; use `npm run test:email` when touching email templates or Resend-related code. When adding tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the module under test, and cover commerce, stock, checkout, and admin flows before cosmetic-only UI.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `created about us page and changes in homepage` and `add/remove/edit shop items in the admin dashboard`. Keep commits focused and describe the user-visible change. Pull requests should include a concise description, validation commands run, linked issue if applicable, and screenshots or recordings for UI changes. Mention any required environment, Supabase, Redis, Stripe, or Resend configuration changes.

## Security & Configuration Tips

Keep secrets in `.env.local`; never commit service role keys, Stripe secrets, webhook secrets, Redis URLs, or Resend API keys. Review `docs/supabase-setup.md` and `docs/commerce-setup.md` before changing database, checkout, webhook, or product-image behavior.
