# Restaurant QR Menu

| Folder | What | Deploy |
|---|---|---|
| [`frontend/`](frontend/) | Next.js site + admin panel | Vercel (Root Directory: `frontend`) |
| [`backend/`](backend/) | Express API (admin actions, uses the Supabase service role key) | Render (via [`render.yaml`](render.yaml)) |

Data lives in Supabase. The frontend reads public data directly with the anon key and calls the backend for privileged admin actions.

## Local development

```bash
# Backend → http://localhost:4000
cd backend
cp .env.example .env      # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev

# Frontend → http://localhost:3000 (in another terminal)
cd frontend
cp .env.example .env.local   # fill in Supabase URL/anon key; NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

## Environment variables

**Frontend (Vercel)**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` — backend URL, e.g. `https://cafe-api.onrender.com`

**Backend (Render)**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — secret, backend only
- `CORS_ORIGIN` — comma-separated frontend origins, e.g. `https://your-app.vercel.app`

## Database

- Migrations: [`backend/supabase/migrations/`](backend/supabase/migrations/) — run in the Supabase SQL editor.
- Seed ~200 menu items: `cd backend && npm run seed` (`-- --dry-run`, `-- --recategorize`).
