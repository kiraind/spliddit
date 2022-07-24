const HIGH_SURROGATE_START = 0xD800
const HIGH_SURROGATE_END = 0xDBFF

const LOW_SURROGATE_START = 0xDC00

const REGIONAL_INDICATOR_START = 0x1F1E6
const REGIONAL_INDICATOR_END = 0x1F1FF

const FITZPATRICK_MODIFIER_START = 0x1f3fb
const FITZPATRICK_MODIFIER_END = 0x1f3ff

function spliddit (str: string, delimiter?: string | RegExp): string[]
function spliddit (str: string[], delimiter?: string | RegExp): string[]
function spliddit (str: string | string[], delimiter?: string | RegExp): string[] {
  if (str === undefined || str === null) {
    throw new Error('str cannot be undefined or null')
  }

  if (Array.isArray(str)) {
    str = str.join('')
  }

  if (
    delimiter instanceof RegExp ||
    (typeof delimiter === 'string' && delimiter.length !== 0)
  ) {
    return str.split(delimiter)
  }

  return splitIntoChars(str)
}

export default spliddit

function splitIntoChars (str: string): string[] {
  let i = 0
  let increment
  const result = []

  while (i < str.length) {
    increment = takeHowMany(i, str)
    result.push(str.substring(i, i + increment))
    i += increment
  }

  return result
}

// Decide how many code units make up the current character.
// BMP characters: 1 code unit
// Non-BMP characters (represented by surrogate pairs): 2 code units
// Emoji with skin-tone modifiers: 4 code units (2 code points)
// Country flags: 4 code units (2 code points)
function takeHowMany (i: number, s: string): number {
  const lastIndex = s.length - 1
  const current = s[i]

  // If we don't have a value that is part of a surrogate pair, or we're at
  // the end, only take the value at i
  if (!isFirstOfSurrogatePair(current) || i === lastIndex) {
    return 1
  }

  // If the array isn't long enough to take another pair after this one, we
  // can only take the current pair
  if ((i + 3) > lastIndex) {
    return 2
  }

  const currentPair = current + s[i + 1]
  const nextPair = s.substring(i + 2, i + 5)

  // Country flags are comprised of two regional indicator symbols,
  // each represented by a surrogate pair.
  // See http://emojipedia.org/flags/
  // If both pairs are regional indicator symbols, take 4
  if (isRegionalIndicatorSymbol(currentPair) &&
    isRegionalIndicatorSymbol(nextPair)) {
    return 4
  }

  // If the next pair make a Fitzpatrick skin tone
  // modifier, take 4
  // See http://emojipedia.org/modifiers/
  // Technically, only some code points are meant to be
  // combined with the skin tone modifiers. This function
  // does not check the current pair to see if it is
  // one of them.
  if (isFitzpatrickModifier(nextPair)) {
    return 4
  }

  return 2
}

export function isFirstOfSurrogatePair (ch: string): boolean
export function isFirstOfSurrogatePair (ch: string[]): boolean
export function isFirstOfSurrogatePair (ch: string | string[]): boolean {
  if (typeof ch !== 'string' && !Array.isArray(ch)) {
    return false
  }

  return betweenInclusive(
    ch[0].charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END
  )
}

export function hasPair (s: string): boolean {
  if (typeof s !== 'string') {
    return false
  }

  return s.split('').some(isFirstOfSurrogatePair)
}

function isRegionalIndicatorSymbol (s: string): boolean {
  const codePoint = codePointFromSurrogatePair(s)

  return betweenInclusive(
    codePoint, REGIONAL_INDICATOR_START, REGIONAL_INDICATOR_END
  )
}

function isFitzpatrickModifier (s: string): boolean {
  const codePoint = codePointFromSurrogatePair(s)

  return betweenInclusive(
    codePoint, FITZPATRICK_MODIFIER_START, FITZPATRICK_MODIFIER_END
  )
}

// Turn two code units (surrogate pair) into
// the code point they represent.
function codePointFromSurrogatePair (s: string): number {
  const highOffset = s.charCodeAt(0) - HIGH_SURROGATE_START
  const lowOffset = s.charCodeAt(1) - LOW_SURROGATE_START

  return (highOffset << 10) + lowOffset + 0x10000
}

function betweenInclusive (
  value: number,
  lowerBound: number,
  upperBound: number
): boolean {
  return value >= lowerBound && value <= upperBound
}
