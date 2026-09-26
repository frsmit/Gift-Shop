# 🌊 Bestie Birthday — a beach-day birthday surprise

A mobile-first birthday site that goes from sea-breeze morning to sunset:

| Screen | What happens |
|---|---|
| **Gate** | Countdown until the birthday (dawn sky), then an optional passcode |
| **Landing** | "Happy Birthday {name}" writes itself in, stickers float, tap to dive in (music starts) |
| **Bottles** | 4 messages in bottles bob on the sea — tap one: the cork pops, the scroll flies out |
| **Favourite human** | Taped polaroid collage + iMessage-style bubbles that type themselves |
| **Letter** | Photo + a handwritten letter that fades in word by word |
| **Memories** | Swipeable polaroid deck (golden hour) + sticker ribbon |
| **Wish** | Sunset, scalloped postcard, tap the cake to blow the candles → confetti |

Every page change is a tide wave washing over the screen.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173  (also on your Wi-Fi IP for phone testing)
```

Add `?preview` to the URL to skip the countdown while testing, e.g. `http://localhost:5173/?preview`.

## Personalise

1. **Text** — edit `.env` (every option is documented in `.env.example`). Use `{name}` to insert her name,
   `|` to separate list items and `
` inside `"double quotes"` for new paragraphs.
2. **Photos** — either links or local files:
   - **Google Drive links (recommended):** set each photo to *Share → General access → Anyone with the link*,
     then list the share links one per line, in order, with an optional `| caption`:
     ```
     https://drive.google.com/file/d/1AbC.../view?usp=sharing | the chai place
     https://drive.google.com/file/d/1XyZ.../view
     ```
     Locally put them in `VITE_PHOTO_LINKS="…"` in `.env`; on GitHub use the `BIRTHDAY_PHOTOS` secret.
     Share links are turned into direct, phone-sized images automatically (`lh3.googleusercontent.com/d/<id>=w1600`).
     If a link doesn't load, a placeholder shows instead of a broken image.
   - **Local files:** drop them into `photos/` and run `npm run photos` to shrink them.
   Order: 1 → collage, 2 → letter, 3+ → memories deck.
3. **Song** — put one `.mp3`/`.m4a` in `public/Songs/`. It stays muted until she taps the music button.

## Host on GitHub Pages (free)

The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Create a new repository on github.com (free Pages needs it to be **public**).
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `BIRTHDAY_ENV` — paste the whole contents of your local `.env` (the letters stay out of the public code)
   - `BIRTHDAY_PHOTOS` — your photo links, one per line, optional `| caption`
4. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. **Actions** tab → *Deploy to GitHub Pages* → **Run workflow** (or push again). The site goes live at
   `https://<you>.github.io/<repo>/` — add `?preview` to skip the countdown while checking it.

Changed a secret? Re-run the workflow; secrets are only read at build time.

> What's public: the code, the song in `public/Songs`, and the built site (which contains the texts and
> photo links). `.env` and `photos/` are git-ignored. The passcode is a cute gate, not real security.

## Or deploy to Vercel

Import the repo on vercel.com (framework **Vite**, output `dist`), then add the `VITE_*` keys from `.env`
and `BIRTHDAY_PHOTOS` under **Project → Settings → Environment Variables**.

## Built with

Motion · GSAP · React Spring (+ use-gesture) · shadcn/ui · Magic UI (confetti, typing, text-animate,
sparkles, marquee) · Aceternity UI (wavy background, 3D card) · Animate UI (ripple button, sliding number) ·
React Bits (SplitText, BlurText, ClickSpark) · Tailwind CSS v4 · Vite + React 19.

Animated stickers: [Noto Emoji](https://github.com/googlefonts/noto-emoji) animations by Google, CC BY 4.0.
