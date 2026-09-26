// Downsizes the animated Noto emoji stickers (CC BY 4.0) so they stay light on mobile.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const src = 'scripts/raw-stickers'
const out = 'src/assets/stickers'
fs.mkdirSync(out, { recursive: true })

for (const file of fs.readdirSync(src).filter((f) => f.endsWith('.webp'))) {
  await sharp(path.join(src, file), { animated: true })
    .resize(160, 160)
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(out, file))
  console.log(file, fs.statSync(path.join(out, file)).size)
}
