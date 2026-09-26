// Phones and tablets (touch-first devices) get lighter effects: fewer sparkles, no filter
// shadows on animated stickers, no blur-in text. Desktops keep everything.
export const lite = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
