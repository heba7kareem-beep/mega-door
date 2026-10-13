# MEGA DOOR (ميكا للأبواب): project notes for Claude

Last updated: 2026-10-13. Read this before starting work in a new session.

## What this is
An Arabic (RTL) online catalog for MEGA DOOR, a door company in Iraq. It has **no cart and no payments**: every customer action ends in WhatsApp. Visitors see a public site. The owner manages content through a hidden admin panel at `/admin`.

- Stack: React 18 + TypeScript + Vite 5 + Tailwind 3 + React Router 6 + Supabase (`@supabase/supabase-js`).
- Repo: `C:\Users\NSR.AS\Desktop\mega-door`. GitHub `heba7kareem-beep/mega-door`, branch `main`.
- Live: https://heba7kareem-beep.github.io/mega-door/ (GitHub Pages; `.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`).
- Supabase project: `ecyxhlkkvjhensgymgdw` (URL and anon key are in `src/lib/supabaseClient.ts`). Models, categories, site settings and spec templates live in Supabase. Images go to Supabase Storage.
- The user talks in Iraqi Arabic, so reply in the same dialect. They usually run `git push` themselves after Claude commits.

## Hard rules (from the user)
1. **Mobile first ("97% يهمني التصميم ع فون").** Check every visual change at about 375px width before calling it done.
2. **The logo is final.** Use `public/images/brand/mega-door-logo.png`, `mega-door-icon.png` and `favicon-*.png` exactly as they are. Never redesign, recolor or replace them, not even in mockups.
3. Make only the change that was asked for. The user often says "بدون اي تغيير ثاني" (no other changes). Don't touch model data, the DB or unrelated features.
4. Before every commit, run `npx tsc --noEmit` and `npm run build`. Both must be clean.
5. The user wants full control from the admin panel, without code edits for routine content changes.

## Structure (quick map)
- `src/pages/`: Home, CategoryList (`/:categorySlug`), ModelDetail (`/model/:id`), Popular, Search, DesignYourDoor, Admin, ResetPassword, NotFound.
- `src/components/admin/`: AdminLoginGate (Supabase auth), ModelForm, CategoryManager, ImageUploader, SiteSettingsManager, SpecTemplateManager.
- `src/lib/`: `*Store.ts` (Supabase data access), `whatsapp.ts`, `seo.ts`, `metaPixel.ts` (wired up but no Pixel ID yet), `imageUpload.ts` / `imageResize.ts`.
- `scripts/generate-model-share-pages.mjs`: runs after `vite build`. It writes static `dist/model/<id>/index.html` pages with Open Graph tags in the raw HTML, for WhatsApp/Facebook link previews. **It is non-fatal on purpose**: if it fails it logs a warning and the deploy carries on.
- `public/404.html`: SPA fallback for GitHub Pages.

## Features done so far
- Category pages, model detail page with a gallery (swipe on touch, RTL, synced thumbnails), a "Most popular" section and page (the admin chooses per model whether it shows there), and search.
- Admin: full CRUD for models and categories, image upload (compressed to JPEG client-side), reusable spec templates, color and price fields, site settings, and a working Supabase password reset at `/reset-password`.
- Animated wood-shavings background that reacts to mouse/touch, a universal hamburger menu, and a site-wide swipe-back gesture (turned off inside the gallery).
- Custom-design form at `/design-your-door`: one simple form, standard size example 100×210 everywhere. It sends details to WhatsApp, and an uploaded photo goes out as a real link. The homepage section for it was **removed** on 2026-10-13 (`80d463e`), but the page and route still exist.
- The real models are A1, A2, A3 and A4 (in Supabase). If old models like MD-105/MD-106 show up, that's a stale browser cache, not missing data.

## Recent decisions (WhatsApp)
- A `wa.me` link can only pre-fill text. It **cannot attach an image**. Real attachments would need the WhatsApp Business API (a separate, big project that wasn't done).
- Supabase Storage public URLs send `X-Robots-Tag: none`, which blocks crawler previews of those images. As a test, A1's share image is hosted on GitHub Pages instead (`public/images/models/a1-share.jpg`, `OG_IMAGE_OVERRIDE` in the share-page script).
- At the user's request, these were added and then **removed**: the per-card "استفسر عبر واتساب" button and the model link / photo URL in the inquiry message. The inquiry message now has only the model name and code. Don't add them back unless asked.
- The broken OG domain `megadoor.iq` (dead) was replaced site-wide with the GitHub Pages URL.

## Open items / next steps
1. **⚠️ Test WhatsApp number still active.** `src/lib/whatsapp.ts` has `WHATSAPP_NUMBER = "9647866300946"` (test). The real number is `9647751420001`. Switch it back when the user confirms testing is over.
2. **Check deploys.** CI failed for several pushes around 2026-09-25. Fix `0b8a1cf` stopped tracking `*.tsbuildinfo` and made the share-page script non-fatal. Later pushes from 2026-10-13 are on `main`. Confirm the latest GitHub Actions run is green (no `gh` token here, so ask the user or check the live site).
3. **Static share pages don't seem to be live.** `https://heba7kareem-beep.github.io/mega-door/model/a1/` returned HTTP 404 on 2026-10-13. Either the script fails in CI (it is non-fatal now, so look for its warning in the Actions log) or the output isn't deployed. Fix this, then test A1 with the Facebook Sharing Debugger. If the GitHub-hosted image works, roll it out to the other models.
4. The user postponed ("بعدين اختبره") a live end-to-end test of the WhatsApp flows on a phone.
5. The Meta Pixel ID still needs adding in `index.html`.
6. `README.md` is outdated: it still says Supabase is "coming later" and mentions placeholder SVG data. Update it if asked.

## Environment quirks
- Windows. The repo path has no Arabic characters, so the dev server works: `npm run dev` (port 5173), or `npm run build && npm run preview`.
- Local `main` may lag behind `origin/main` because some commits come from other (cloud) sessions. Always run `git pull --ff-only` first.
- Related but separate project: "Ard" (أرض) doors site at `C:\Users\NSR.AS\Desktop\مشروع موقع ارض` (Next/Cloudflare). It is paused and has its own `PROJECT_HANDOFF.md`. Don't mix the two.
