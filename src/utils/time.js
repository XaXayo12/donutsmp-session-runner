export function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)))
}

export function randomInt (min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

export function randomDelay (base, jitter) {
  return Math.max(1000, base + randomInt(0, jitter))
}
