# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build (outputs to dist/)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

There are no tests. The API functions run on Vercel serverless — to test them locally, use `vercel dev` (requires Vercel CLI).

## Architecture

ProofKit is a French SaaS app targeting delivery restaurants (Uber Eats, Deliveroo, etc.) to capture and AI-analyze order ticket photos as proof of delivery.

**Frontend**: React 19 + Vite SPA. All app logic lives in a single large file (`src/App.jsx`, ~1300 lines). No component files, no routing library — views are conditionally rendered based on `activeTab` state. CSS is injected via a `makeStyles(dark)` function that returns a template literal string injected as a `<style>` tag. Landing page is in `src/Landing.jsx` with its own scoped CSS (`.pk-*` prefixed classes).

**Backend**: Vercel serverless functions in `api/`:
- `analyze.js` — Proxies image analysis requests to Anthropic API (Claude Haiku). Uses `ANTHROPIC_API_KEY` env var server-side. The model receives base64-encoded receipt images and returns JSON with `order_number`, `status` (ok/warning/alert), `anomaly`, `items_detected`, `confidence`.
- `create-checkout.js` — Creates Stripe checkout sessions. 7-day trial is only offered if `trial_used` is false on the restaurant record.
- `stripe-webhook.js` — Handles `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, and `customer.subscription.deleted` to toggle `subscribed` on the restaurant. Falls back to customer email lookup when `metadata.restoId` is missing.
- `cancel-subscription.js` — Cancels active/trialing/past_due Stripe subscriptions for a restaurant.
- `delete-account.js` — Cancels Stripe sub, deletes Supabase storage files from the `proofs` bucket, then cascades deletes: records → users → restaurant.
- `send-email.js` — Sends transactional emails via Resend (`hello@proofkit.fr`). Types: `welcome`, `subscription_activated`, `subscription_cancelled`.
- `download.js` — Fetches a proof image by URL, injects a timestamp into EXIF metadata, and returns the modified JPEG for download.

**Database** (Supabase): Three tables — `restaurants` (id, name, email, password, subscribed, trial_used), `users` (id, restaurant_id, name, email, username, password, role), `records` (id, restaurant_id, author, author_id, order_number, status, anomaly, items_detected, confidence, img_src, img_src_2, img_b64, img_b64_2, timestamp). Images are stored in the `proofs` storage bucket. The Supabase client (`src/supabase.js`) uses a hardcoded anon key — service-level operations use `SUPABASE_SERVICE_KEY` in API functions.

**Auth model**: No Supabase Auth. Authentication is manual: the superadmin has hardcoded credentials in `INIT_DATA` inside `App.jsx`; restaurant users authenticate by querying the `users` table directly with email + password (plaintext). Session is stored in `localStorage` as `proofkit_session`.

**User roles**:
- `superadmin` — hardcoded, manages all restaurants (toggle subscription, delete)
- `manager` — access to all tabs: Capturer, Preuves, Alertes, Équipe, Admin, Abonnement
- `employee` — access to Capturer, Preuves, Alertes only

**Subscription gate**: Unsubscribed restaurants are limited to 3 proofs/day (checked via Supabase count query). Full access requires an active Stripe subscription at 14.99€/month.

**Image processing**: Client-side compression to 1024px max + JPEG 0.7 quality before sending to Claude. EXIF timestamps are written using `piexifjs` both client-side (on capture) and server-side (on download via `api/download.js`).

## Key env vars

| Var | Used in |
|-----|---------|
| `VITE_ANTHROPIC_API_KEY` | Client-side fallback (should not be used) |
| `ANTHROPIC_API_KEY` | `api/analyze.js` |
| `STRIPE_SECRET_KEY` | Stripe API functions |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js` |
| `VITE_SUPABASE_URL` | API functions (service client) |
| `SUPABASE_SERVICE_KEY` | API functions (bypasses RLS) |
| `RESEND_API_KEY` | `api/send-email.js` |

## Deployment

Deployed on Vercel. The `vercel.json` sets `api/analyze.js` to 30s max duration and deploys to the `cdg1` (Paris) region. Sentry is integrated via `@sentry/vite-plugin` in `vite.config.js` with source maps enabled.
