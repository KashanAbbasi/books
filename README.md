# SHAH-WRITES eBook Store

A light-themed animated eBook storefront built with HTML, CSS, JavaScript, jQuery, Bootstrap, and Supabase.

## Pages
- `index.html` — user storefront.
- `admin.html` — separate admin dashboard to add/edit/remove/hide books.

## Data & PDFs
- Book metadata now comes from the Supabase `public.books` table instead of browser `localStorage`.
- PDF links are stored under `pdf/books/` (add your real files there).

## Supabase setup
1. Create a new Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy `assets/js/config.example.js` to `assets/js/config.js`.
4. Fill in:
   - `supabaseUrl`: `https://YOUR_PROJECT_REF.supabase.co`
   - `supabaseAnonKey`: your Supabase anon/public key
5. Deploy the site.

## Vercel environment variable prefix
Because this repo is plain HTML/JS and not a Next.js app, Vercel will **not** automatically inject browser env vars into these static files. The simplest option is to set the values directly in `assets/js/config.js`.

If you later move this project to **Next.js on Vercel**, use:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

There is no special custom prefix required by Supabase itself.

## Security note
The current admin page still uses a hard-coded demo login in the browser. For production, replace that with Supabase Auth and tighten your Row Level Security policies.

## Deploy
1. Push this folder to GitHub.
2. Import the repo on Vercel or any static host.
3. Make sure `assets/js/config.js` contains your Supabase credentials.
4. Deploy.

## Admin access
- Admin name: `kashanabbasi`
- Password: `kashanabbabb`
