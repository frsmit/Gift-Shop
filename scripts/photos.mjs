// Shrinks phone photos in /photos to ~1400px WebP so the site loads fast on mobile.
// Originals are moved to /photos-original (git-ignored). Safe to run repeatedly.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = 'photos'
const backup = 'photos-original'
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic'])

fs.mkdirSync(backup, { recursive: true })

for (const file of fs.readdirSync(dir)) {
  const ext = path.extname(file).toLowerCase()
  if (!exts.has(ext)) continue
  const src = path.join(dir, file)
  const meta = await sharp(src).metadata()
  const out = path.join(dir, `${path.parse(file).name}.webp`)
  // Skip files that are already small WebPs
  if (ext === '.webp' && Math.max(meta.width ?? 0, meta.height ?? 0) <= 1400) continue

  const buffer = await sharp(src)
    .rotate() // respect phone EXIF orientation
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  fs.renameSync(src, path.join(backup, file))
  fs.writeFileSync(out, buffer)
  console.log(`${file} → ${path.basename(out)} (${Math.round(buffer.length / 1024)} KB)`)
}
