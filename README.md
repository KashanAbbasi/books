# SHAH-WRITES eBook Store

A light-themed animated eBook storefront built with HTML, CSS, JavaScript, jQuery, Bootstrap, Vercel serverless functions, and Supabase.

## Pages
- `index.html` — public storefront.
- `admin.html` — admin dashboard to add/edit/remove/hide books.
- `api/books.js` — Vercel serverless API that talks to Supabase using environment variables.

## How the connection works now
- The browser no longer stores books in `localStorage`.
- The storefront calls `/api/books` to load visible books.
- The admin dashboard calls `/api/books` for create/update/delete actions.
- The serverless function reads Supabase credentials from `.env.local` during local development or from Vercel environment variables in production.
- Private Supabase secrets stay on the server side instead of being shipped to the browser.

## `.env.local` setup
Create a file named `.env.local` in the project root and add these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lwisrgraxwvbjnbdowwy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_USER=kashanabbasi
ADMIN_PASS=kashanabbabb
```

A starter template is included in `.env.local.example`.

## Which of your Supabase/Vercel env vars are actually needed here
Use these for this project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER`
- `ADMIN_PASS`

Do **not** expose these in browser code:
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `POSTGRES_PASSWORD`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `SUPABASE_JWT_SECRET`

You do **not** need the Postgres connection strings for this static/Vercel-function setup.

## Supabase database setup
1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Add the environment variables above locally in `.env.local` and in Vercel Project Settings.
5. Deploy.

## Security note about the current admin flow
This repo still uses a simple demo admin username/password flow. The browser sends those credentials to the serverless API, and the API checks them before using the Supabase service role key on the server. That is better than exposing the service role key in the browser, but it is still not a full production auth system. For production, move admin login to Supabase Auth or another secure server-side auth flow.
