// Word lists for access code generation
// Format: ADJECTIVE-NOUN-NN (e.g., "SWIFT-BEAR-73")
// ~250,000 unique combinations (50 × 50 × 100)

const ADJECTIVES = [
  'SWIFT', 'CALM', 'BOLD', 'WISE', 'KEEN',
  'BRAVE', 'QUICK', 'WARM', 'COOL', 'FAIR',
  'BRIGHT', 'CLEAR', 'FRESH', 'GRAND', 'GREAT',
  'HAPPY', 'JOLLY', 'KIND', 'NOBLE', 'PROUD',
  'QUIET', 'RAPID', 'SHARP', 'SMART', 'SOFT',
  'STEADY', 'STRONG', 'TRUE', 'VIVID', 'WILD',
  'AGILE', 'CLEVER', 'COSMIC', 'DARING', 'EAGER',
  'FIERCE', 'GENTLE', 'HIDDEN', 'HUMBLE', 'LIVELY',
  'LUCKY', 'MIGHTY', 'NIMBLE', 'PATIENT', 'PEACEFUL',
  'PLAYFUL', 'RADIANT', 'SERENE', 'SILENT', 'SIMPLE',
]

const NOUNS = [
  'BEAR', 'WOLF', 'HAWK', 'DEER', 'LION',
  'TIGER', 'EAGLE', 'RIVER', 'OCEAN', 'STORM',
  'CLOUD', 'FLAME', 'FROST', 'STONE', 'CORAL',
  'CEDAR', 'MAPLE', 'LOTUS', 'BROOK', 'CANYON',
  'COMET', 'EMBER', 'FORGE', 'GROVE', 'HAVEN',
  'KNIGHT', 'LARK', 'MEADOW', 'NEBULA', 'ORBIT',
  'PEARL', 'QUARTZ', 'RAVEN', 'SAGE', 'SPARK',
  'SUMMIT', 'THUNDER', 'TRAIL', 'VAPOR', 'WILLOW',
  'AURORA', 'BREEZE', 'CREST', 'DAWN', 'FERN',
  'GLACIER', 'HARBOR', 'ISLAND', 'JADE', 'PEAK',
]

// Friendly adjectives for display names
const DISPLAY_ADJECTIVES = [
  'Curious', 'Swift', 'Clever', 'Brave', 'Eager',
  'Happy', 'Bright', 'Calm', 'Bold', 'Kind',
]

// Friendly animals for display names
const DISPLAY_ANIMALS = [
  'Panda', 'Fox', 'Owl', 'Bear', 'Wolf',
  'Tiger', 'Eagle', 'Deer', 'Hawk', 'Lion',
]

// Curated emoji list for avatars
const AVATAR_EMOJIS = [
  '🐼', '🦊', '🦉', '🐻', '🐺',
  '🐯', '🦅', '🦌', '🦁', '🐸',
  '🦄', '🐙', '🦋', '🌟', '🚀',
]

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate a unique access code in format "ADJECTIVE-NOUN-NN"
 * Example: "SWIFT-BEAR-73"
 */
export function generateAccessCode(): string {
  const adj = randomElement(ADJECTIVES)
  const noun = randomElement(NOUNS)
  const num = String(Math.floor(Math.random() * 100)).padStart(2, '0')
  return `${adj}-${noun}-${num}`
}

/**
 * Generate a friendly display name like "Curious Panda"
 */
export function generateDisplayName(): string {
  const adj = randomElement(DISPLAY_ADJECTIVES)
  const animal = randomElement(DISPLAY_ANIMALS)
  return `${adj} ${animal}`
}

/**
 * Pick a random avatar emoji
 */
export function pickRandomAvatar(): string {
  return randomElement(AVATAR_EMOJIS)
}

/**
 * Normalize an access code for comparison (uppercase, trimmed)
 */
export function normalizeAccessCode(code: string): string {
  return code.toUpperCase().trim()
}

/**
 * Validate access code format (WORD-WORD-NN)
 */
export function isValidAccessCodeFormat(code: string): boolean {
  const normalized = normalizeAccessCode(code)
  const pattern = /^[A-Z]+-[A-Z]+-\d{2}$/
  return pattern.test(normalized)
}
