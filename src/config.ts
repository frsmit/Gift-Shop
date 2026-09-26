// All personal content comes from .env (see .env.example). Photos come from links
// (BIRTHDAY_PHOTOS secret / VITE_PHOTO_LINKS) or the /photos folder; the song from
// public/Songs or the /song folder.

const env = import.meta.env

const str = (value: string | undefined, fallback: string) =>
  value && value.trim() ? value.trim() : fallback

const name = str(env.VITE_FRIEND_NAME, 'bestie')

// Replace {name} and turn literal "\n" into real line breaks.
const fill = (text: string) => text.replaceAll('{name}', name).replaceAll('\\n', '\n')

const text = (value: string | undefined, fallback: string) => fill(str(value, fallback))

const list = (value: string | undefined, fallback: string) =>
  text(value, fallback)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)

const paragraphs = (value: string | undefined, fallback: string) =>
  text(value, fallback)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

const byFileName = (files: Record<string, string>) =>
  Object.entries(files)
    .map(([path, url]) => ({ file: path.split('/').pop()!, url }))
    .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))

const photoFiles = byFileName(
  import.meta.glob('/photos/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

const songFiles = byFileName(
  import.meta.glob('/song/*.{mp3,m4a,ogg,wav,aac,MP3,M4A}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

export type Photo = { url: string; caption?: string }

// Google Drive share links open a viewer page, not the image. This serves the picture
// itself, resized to 1600px so it loads quickly on a phone. Other URLs pass through.
export function toImageUrl(link: string) {
  const id = link.match(/\/d\/([\w-]{10,})/)?.[1] ?? link.match(/[?&]id=([\w-]{10,})/)?.[1]
  if (link.includes('drive.google.com') && id) return `https://lh3.googleusercontent.com/d/${id}=w1600`
  if (/^[\w-]{25,}$/.test(link)) return `https://lh3.googleusercontent.com/d/${link}=w1600` // a bare file id
  return link
}

// One link per line (a literal "\n" also works), optionally followed by "| caption".
const linkedPhotos = (): Photo[] =>
  __PHOTO_LINKS__
    .replaceAll('\\n', '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [link, ...rest] = line.split('|')
      const caption = rest.join('|').trim()
      return { url: toImageUrl(link.trim()), caption: caption ? fill(caption) : undefined }
    })

const pickPhotos = (): Photo[] => {
  const links = linkedPhotos()
  if (links.length) return links
  const wanted = list(env.VITE_PHOTOS, '')
  const files = wanted.length
    ? wanted.map((w) => photoFiles.find((p) => p.file === w)).filter((p) => p !== undefined)
    : photoFiles
  return files.map((p) => ({ url: p.url }))
}

const pickSong = () => {
  const all = [
    ...songFiles,
    // BASE_URL keeps this working when the site lives in a sub-folder (GitHub Pages)
    ...__PUBLIC_SONGS__.map((file) => ({ file, url: `${import.meta.env.BASE_URL}Songs/${encodeURIComponent(file)}` })),
  ]
  const wanted = str(env.VITE_SONG_FILE, '')
  return (all.find((s) => s.file === wanted) ?? all[0])?.url
}

const birthdayAt = new Date(str(env.VITE_BIRTHDAY_AT, '2026-09-27T00:00:00+05:30'))

export const config = {
  name,
  signature: text(env.VITE_SIGNATURE, 'Forever your partner in crime 🌊'),
  pageTitle: text(env.VITE_PAGE_TITLE, 'Happy Birthday {name} 🌊'),

  countdown: str(env.VITE_COUNTDOWN, 'true') !== 'false' && !Number.isNaN(birthdayAt.getTime()),
  birthdayAt,

  passcode: str(env.VITE_PASSCODE, ''),
  passcodeHint: text(env.VITE_PASSCODE_HINT, ''),

  tagline: text(env.VITE_TAGLINE, 'To the girl who makes every day feel like summer'),

  bottleLabels: list(env.VITE_BOTTLE_LABELS, 'Open me first|A little letter|Our memories|Open me last'),
  allOpenedMessage: text(
    env.VITE_ALL_OPENED_MESSAGE,
    'You found every bottle! Now go blow those candles 🎂',
  ),

  sandText: text(env.VITE_SAND_TEXT, '{name}'),
  shellNotes: list(
    env.VITE_SHELL_NOTES,
    "your laugh is my favourite sound|you make every plan 10x more fun|you're braver than you think|the world is brighter with you in it|you're the best hype-girl ever",
  ),

  favTitle: text(env.VITE_FAV_TITLE, 'My favourite human'),
  chatMessages: list(env.VITE_CHAT_MESSAGES, "you're stuck with me forever|no returns, no refunds 😌"),

  letterTitle: text(env.VITE_LETTER_TITLE, 'Dear {name},'),
  letter: paragraphs(
    env.VITE_LETTER,
    'Happy birthday to the one who turns ordinary days into the best stories.',
  ),

  memoriesTitle: text(env.VITE_MEMORIES_TITLE, 'Summer memories'),
  memoryCaptions: list(
    env.VITE_MEMORY_CAPTIONS,
    'the day it all started|us, being iconic|core memory unlocked|more adventures loading...',
  ),
  memoriesFooter: text(env.VITE_MEMORIES_FOOTER, 'friends always & forever'),

  finalTitle: text(env.VITE_FINAL_TITLE, 'Make a wish, {name}'),
  finalMessage: paragraphs(
    env.VITE_FINAL_MESSAGE,
    "Out of everyone in the world, I'm so lucky I get to call you my best friend.",
  ),

  photos: pickPhotos(),
  song: pickSong(),
  songVolume: Math.min(1, Math.max(0, Number(str(env.VITE_SONG_VOLUME, '0.55')) || 0.55)),
}

// Placeholder shown until real photos are added (and if a photo link fails to load).
export const placeholder = (i: number) => {
  const hues = [
    ['#7dd3e8', '#fef3dc'],
    ['#ffb38a', '#fde2c4'],
    ['#5bb6d6', '#d9f3f4'],
    ['#f6a5a0', '#fff1dd'],
  ][i % 4]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hues[0]}"/><stop offset="1" stop-color="${hues[1]}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="290" cy="120" r="48" fill="#fff6d6" opacity=".9"/><path d="M0 290 Q100 260 200 290 T400 290 V400 H0Z" fill="#ffffff" opacity=".45"/><text x="200" y="360" font-family="sans-serif" font-size="26" text-anchor="middle" fill="#0e3b5c" opacity=".7">photo ${i + 1} goes here</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const photo = (i: number) =>
  config.photos.length ? config.photos[i % config.photos.length].url : placeholder(i)

/** The caption given with a photo link, or the screen's own default. */
export const photoCaption = (i: number, fallback: string) =>
  (config.photos.length ? config.photos[i % config.photos.length].caption : undefined) ?? fallback
