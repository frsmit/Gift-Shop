import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  // Songs dropped into public/Songs are served as-is; list them so the app can find them.
  const songsDir = path.resolve(import.meta.dirname, 'public/Songs')
  const publicSongs = fs.existsSync(songsDir)
    ? fs.readdirSync(songsDir).filter((f) => /\.(mp3|m4a|ogg|wav|aac)$/i.test(f)).sort()
    : []

  // Photo links (Google Drive or any image URL), one per line, optional "| caption".
  // BIRTHDAY_PHOTOS comes from a GitHub Actions secret; VITE_PHOTO_LINKS from .env.
  const photoLinks = process.env.BIRTHDAY_PHOTOS || env.VITE_PHOTO_LINKS || ''

  return {
    // GitHub Pages serves the site from /<repo>/; Vercel and local dev use /
    base: process.env.VITE_BASE || env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
    define: {
      __PUBLIC_SONGS__: JSON.stringify(publicSongs),
      __PHOTO_LINKS__: JSON.stringify(photoLinks),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
