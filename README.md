# Crypto prediction

Crypto prediction is a Next.js 14 application that visualises market data for the five most traded crypto-assets and offers educational mock predictions. The project is optimised for deployment on Vercel and uses Tailwind CSS, Recharts and type-safe API routes validated with Zod.

## ✨ Features

- Server-rendered dashboards with live price highlights for BTC, ETH, BNB, XRP and SOL.
- Interactive timeframe toggle (24h / 7d / 30d / 90d) without full page reloads.
- Coin detail pages with historical charts, seeded mock forecasts and demo linear regression extrapolations.
- Type-safe API layer built with Next.js route handlers and Zod validation.
- Dark/light mode, accessible UI patterns and reusable design components.
- Optional `/api/warmup` endpoint compatible with an hourly Vercel Cron job to keep caches warm.

## 🚀 Getting started

```bash
pnpm install
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

### Environment variables

Duplicate `.env.local.example` into `.env.local` to customise configuration.

| Variable | Description |
| --- | --- |
| `COIN_API_URL` | Optional override for the upstream price API (defaults to CoinGecko). |
| `PREDICTION_SEED` | Seed used by the mock prediction model to keep results deterministic. |

### Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Generate a production build. |
| `pnpm start` | Launch the production server. |
| `pnpm lint` | Run Next.js linting (ESLint + TypeScript). |
| `pnpm test` | Execute Vitest unit tests. |

## 🧪 Tests

The project includes a Vitest unit test that validates the linear regression extrapolation logic:

```bash
pnpm test
```

## ☁️ Deployment to Vercel

1. Push this repository to GitHub.
2. In the Vercel dashboard click **Import Project** and select the repo.
3. Confirm the project root (no monorepo configuration required).
4. Set the build command to `pnpm build` and the output directory to `.next`.
5. Add any environment variables defined in `.env.local`.
6. Deploy. Vercel will handle install/build/start automatically.

### Optional: Vercel Cron warm-up

The included `vercel.json` schedules an hourly request to `/api/warmup`:

```json
{
  "crons": [
    {
      "path": "/api/warmup",
      "schedule": "0 * * * *"
    }
  ]
}
```

This keeps cached price series fresh before users land on the site.

## 📄 License

Released for educational purposes. Not financial advice.
