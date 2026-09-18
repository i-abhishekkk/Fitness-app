// One-off local script to rasterize public/icons/*.svg into the PNG sizes the PWA
// manifest and index.html need. Not part of the app build — run manually with
// `node scripts/render-icons.mjs` whenever the icon source SVGs change.
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const jobs = [
  { src: 'icon.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon.svg', out: 'icon-512.png', size: 512 },
  { src: 'icon-maskable-source.svg', out: 'maskable-512.png', size: 512 },
  { src: 'icon-maskable-source.svg', out: 'apple-touch-icon.png', size: 180 },
]

for (const job of jobs) {
  const inPath = path.join(dir, job.src)
  const outPath = path.join(dir, job.out)
  await sharp(inPath, { density: 384 }).resize(job.size, job.size).png().toFile(outPath)
  console.log(`${job.out} (${job.size}x${job.size}) written`)
}
