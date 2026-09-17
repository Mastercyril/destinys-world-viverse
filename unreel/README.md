# Destiny's World UNREEL app

The `unreel/` directory is now branded for Destiny's World and uses the repository's four VIVERSE zones as its catalog.

## Local development

```bash
cd unreel
npm install
npm run dev
```

## Vercel deployment

Create a Vercel project from this GitHub repository and set **Root Directory** to `unreel`. Vercel will detect Next.js and use `unreel/vercel.json`.

The catalog API is available at `/api/catalog` and returns the zone/title data used by the UI.

## Assets

The app uses local artwork in `unreel/public/destiny-assets/`. If you add real VIVERSE media, place it in `unreel/public/assets/video/` and set the matching `preview` path in `unreel/lib/catalog.ts`.

The existing root `assets/` directory currently contains documentation but no binary models, textures, audio, or video files, so no external game files were copied or invented.
