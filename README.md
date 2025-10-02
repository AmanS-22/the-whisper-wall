
## Supabase connectivity

This version supports the same Supabase backend used in your old repo.

Setup
- Copy `.env.example` to `.env` and fill:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Install and run:
  - npm i
  - npm run dev

Code
- `src/lib/supabaseClient.ts` creates the Supabase client from Vite env.
- `src/services/notes.ts` provides `fetchNotes` and `createNote` using the `notes` table.
- `src/App.tsx` loads notes on mount and posts new notes from the compose modal.

Database
- Table `notes` with columns:
  - `id` uuid primary key default gen_random_uuid()
  - `quote` text
  - `created_at` timestamptz default now()
- Policies: allow anon `select` and `insert` if your app is public.

Build/Deploy
- Ensure env vars are set on your host (e.g., Vercel project settings).
- Run `npm run build` → output in `build/`.

  # Scroll Down Feature for Whisper Wall

  This is a code bundle for Scroll Down Feature for Whisper Wall. The original project is available at https://www.figma.com/design/xbjxfJS0Ml9D7XpOIEH4gU/Scroll-Down-Feature-for-Whisper-Wall.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  