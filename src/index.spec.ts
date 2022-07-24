import test from 'tape'

import spliddit, { hasPair, isFirstOfSurrogatePair } from './index'

test('emoji in middle', function (t) {
  const result = spliddit('abc😤def')

  t.deepEqual(result, ['a', 'b', 'c', '😤', 'd', 'e', 'f'])
  t.end()
})

test('emoji start', function (t) {
  const s = '🍕abd'

  t.deepEqual(spliddit(s), ['🍕', 'a', 'b', 'd'])
  t.end()
})

test('emoji end', function (t) {
  const s = '123🍥'

  t.deepEqual(spliddit(s), ['1', '2', '3', '🍥'])
  t.end()
})

test('emoji party', function (t) {
  const result = spliddit('🍕⚽⛵✨⏳☕⏰🇯🇲😍👍💅😋👭👯✊👸🏽')

  t.deepEqual(result, [
    '🍕', '⚽', '⛵', '✨', '⏳', '☕', '⏰', '🇯🇲',
    '😍', '👍', '💅', '😋', '👭', '👯', '✊', '👸🏽'
  ])

  t.end()
})

test('check', function (t) {
  const result = spliddit('123🍕✓')

  t.deepEqual(result, ['1', '2', '3', '🍕', '✓'])
  t.end()
})

test('reverse string', function (t) {
  const s = '123🍕✓'

  const sReverse = spliddit(s).reverse().join('')
  const sReverse2 = spliddit(sReverse).reverse().join('')

  t.equal('✓🍕321', sReverse)
  t.equal(s, sReverse2)
  t.end()
})

test('single char', function (t) {
  const s = 'a'

  t.deepEqual(spliddit(s), ['a'])
  t.end()
})

test('regular string', function (t) {
  const s = 'Hello how are you'
  const arr = spliddit(s)

  t.equal(arr.length, 17)
  t.equal(arr[0], 'H')
  t.equal(arr[16], 'u')
  t.end()
})

test('chinese', function (t) {
  const s = '𨭎", "𠬠", and "𩷶"'
  const result = spliddit(s)

  t.equal(result.length, 16)
  t.equal(result[0], '𨭎')
  t.equal(result[1], '"')
  t.equal(result[5], '𠬠')
  t.equal(result[6], '"')
  t.equal(result[14], '𩷶')
  t.equal(result[15], '"')
  t.end()
})

test('en dash', function (t) {
  const s1 = 'and then–boom'
  const result1 = spliddit(s1)

  t.equal(result1.length, 13)
  t.equal(result1[8], '–')

  const s2 = 'ab–c'
  const result2 = spliddit(s2)
  t.deepEqual(result2, ['a', 'b', '–', 'c'])
  t.end()
})

test('math script', function (t) {
  const s = '𝒞𝒯𝒮𝒟'

  t.deepEqual(spliddit(s), ['𝒞', '𝒯', '𝒮', '𝒟'])
  t.end()
})

test('fraktur', function (t) {
  const s = '𝔅𝔎'

  t.deepEqual(spliddit(s), ['𝔅', '𝔎'])
  t.end()
})

test('acrophonic', function (t) {
  const s = '𐅧, 𐅨, and 𐅩'
  const result = spliddit(s)

  t.equal(result.length, 11)
  t.equal(result[0], '𐅧')
  t.equal(result[1], ',')
  t.equal(result[3], '𐅨')
  t.equal(result[4], ',')
  t.equal(result[10], '𐅩')
  t.end()
})

test('pass in munged array', function (t) {
  const emojiString = 'No 🙅'
  const arr = emojiString.split('')

  t.deepEqual(spliddit(arr), spliddit(emojiString))
  t.deepEqual(spliddit(arr), ['N', 'o', ' ', '🙅'])
  t.end()
})

test('throws for null and undefined', function (t) {
  // @ts-expect-error
  const undefinedFunction = function (): void { spliddit(undefined) }
  // @ts-expect-error
  const nullFunction = function (): void { spliddit(null) }

  t.throws(undefinedFunction)
  t.throws(nullFunction)
  t.end()
})

test('arabic', function (t) {
  const s = 'ځڂڃڄڅچڇڈ'

  t.deepEqual(spliddit(s), ['ځ', 'ڂ', 'ڃ', 'ڄ', 'څ', 'چ', 'ڇ', 'ڈ'])
  t.end()
})

test('country flags/regional indicator characters', function (t) {
  const s = '🇦🇸' // American Samoa flag
  const flagInMiddle = 'Sup 🇮🇹 Italy' // Italian flag in middle

  t.deepEqual(spliddit(s), [s])
  t.equal(spliddit(s).join(''), s)

  t.equal(spliddit(flagInMiddle).length, 11)
  t.equal(spliddit(flagInMiddle).join(''), flagInMiddle)
  t.equal(spliddit(flagInMiddle).reverse().join(''), 'ylatI 🇮🇹 puS')
  t.end()
})

test('emoji with skin tone indicators', function (t) {
  const s = '🎅🏻🎅🏼🎅🏽🎅🏾🎅🏿'
  const s2 = 'hi santa 🎅🏾 lol'

  t.deepEqual(spliddit(s), ['🎅🏻', '🎅🏼', '🎅🏽', '🎅🏾', '🎅🏿'])
  t.equal(spliddit(s).join(''), s)
  t.equal(spliddit(s2).length, 14)
  t.equal(spliddit(s2).join(''), s2)
  t.end()
})

test('has pair', function (t) {
  t.ok(hasPair("hello 𝔎 what's up"))
  t.ok(hasPair('👔'))
  t.ok(hasPair('𐅕'))
  t.ok(hasPair('🏼'))

  t.notOk(hasPair('hello'))
  t.notOk(hasPair('ڃ'))
  t.notOk(hasPair('–'))
  t.end()
})

test('first of pair', function (t) {
  t.ok(isFirstOfSurrogatePair('🐳'))
  t.ok(isFirstOfSurrogatePair(['🐣']))
  t.ok(isFirstOfSurrogatePair('🚯'.charAt(0)))
  t.ok(isFirstOfSurrogatePair(['🔫'.charAt(0)]))
  t.ok(isFirstOfSurrogatePair(String.fromCharCode(0xD801)))

  t.notOk(isFirstOfSurrogatePair('a'))
  t.notOk(isFirstOfSurrogatePair('Hello'))
  t.notOk(isFirstOfSurrogatePair('–'))
  t.end()
})

test('split by delimiter', function (t) {
  t.deepEqual(spliddit('abc', 'b'), ['a', 'c'])
  t.deepEqual(spliddit('abcd', 'e'), ['abcd'])
  t.deepEqual(spliddit('abcd', ''), ['a', 'b', 'c', 'd'])
  t.deepEqual(spliddit('1-800-867-5309', '-'), ['1', '800', '867', '5309'])
  t.deepEqual(spliddit('🐣🐳🐣', '🐳'), ['🐣', '🐣'])
  t.deepEqual(spliddit('abcddddabc', 'dddd'), ['abc', 'abc'])
  t.deepEqual(spliddit('ځڂڃڄڅچڇڈ', 'ڄڅ'), ['ځڂڃ', 'چڇڈ'])
  t.deepEqual(spliddit('ab🇦🇸cd', '🇦🇸'), ['ab', 'cd'])
  t.deepEqual(spliddit('⚽⛵✨⏳', 'a'), ['⚽⛵✨⏳'])
  t.deepEqual(spliddit('yuj390', '⚽'), ['yuj390'])
  t.deepEqual(spliddit('wow✨wow', '✨'), ['wow', 'wow'])
  t.deepEqual(spliddit('✨wow✨', 'wow'), ['✨', '✨'])
  t.deepEqual(spliddit('d✨wow✨d', '✨wow✨'), ['d', 'd'])
  t.deepEqual(spliddit('wow', 'wow'), ['', ''])
  t.deepEqual(spliddit('wow✨', '✨'), ['wow', ''])
  t.deepEqual(spliddit('✨wow', '✨'), ['', 'wow'])
  t.deepEqual(spliddit('abcd', /b/), ['a', 'cd'])

  t.end()
})
