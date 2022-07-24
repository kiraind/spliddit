spliddit
========

> This is a fork of [essdot/spliddit](https://github.com/essdot/spliddit)

Spliddit — unicode-aware JS string splitting

Split a string into its constituent characters, without munging emoji and other non-BMP code points.

## Installation

```sh
npm i @kiraind/spliddit
```

## Why?

The native `String#split` implementation does not pay attention to [surrogate pairs](http://en.wikipedia.org/wiki/UTF-16). When the code units of a surrogate pair are split apart, they are not intelligible on their own. Unless they are put back together in the correct order, individual code units will cause problems in code that handles strings.

Consider:

```javascript
const emojiMessage = 'Hello 😤'

emojiMessage.split('').reverse().join('')
// => String with messed-up emoji
```

`spliddit` will correctly split the string into strings consisting of legible characters:

```javascript
import spliddit from '@kiraind/spliddit'

const emojiMessage = 'Hello 😤'

spliddit(emojiMessage).reverse().join('')
// => '😤 olleH'
```

Also, since surrogate pairs take up two spaces in the Javascript string to represent a single character, `spliddit` can help you correctly count the number of code points (characters) in the string:

```javascript
const emoji = '🍔'
const han = '𠬠典'

emoji.length
// => 2
han.length
// => 3

spliddit(emoji).length
// => 1
spliddit(han).length
// => 2
```

Alternatively, you can pass `spliddit` an array that potentially has broken-apart surrogate pairs, and `spliddit` will return an array that has them put back together: 

```javascript
const myCoolString = '😎 Fooool'

// Messed-up array beginning with a split-apart surrogate pair :(
const myBustedArray = myCoolString.split('')

// Aww yeah cool guy is back
const myCoolFixedArray = spliddit(myBustedArray)
```

### Delimiter

You can also pass `spliddit` a second argument, a string or `RegExp` representing the delimiter to split by. The native String#split implementation does this correctly, so `spliddit` just passes through to String#split in this case.

```javascript
spliddit('hi🍔hi', '🍔')
// => ['hi', 'hi']

spliddit('123a456', 'a')
// => ['123', '456']
```

### Country Flags

Country flags like &#x1f1e6;&#x1f1f4; are composed of two *regional indicator* Unicode characters. Each regional indicator character is represented as a surrogate pair in JavaScript strings, so country flags take up 4 code units. The regional indicator symbols follow the alphabet, and the two regional indicators used follow the country's code.

(For example, &#x1f1ee;&#x1f1f9; , Italy's flag, is [`U+1F1EE 'REGIONAL INDICATOR SYMBOL LETTER I'`](http://www.fileformat.info/info/unicode/char/1F1EE/index.htm) followed by [`U+1F1F9 'REGIONAL INDICATOR SYMBOL LETTER T'`](http://www.fileformat.info/info/unicode/char/1F1F9/index.htm).)

`spliddit` will split pairs of regional indicator characters (4 total code units) into one character even though they consist of two Unicode code points.

### Skin tone emoji

Skin tone emojis (&#x1F469;&#x1F3FE;) are composed of a color-neutral emoji that depicts humans (&#x1F469;), followed by one of the 5 Unicode skin tone modifier characters ([&#x1F3FB;](http://www.fileformat.info/info/unicode/char/1F3FB/index.htm), [&#x1F3FC;](http://www.fileformat.info/info/unicode/char/1F3FC/index.htm), [&#x1F3FD;](http://www.fileformat.info/info/unicode/char/1F3FD/index.htm), [&#x1F3FE;](http://www.fileformat.info/info/unicode/char/1F3FE/index.htm), [&#x1F3FF;](http://www.fileformat.info/info/unicode/char/1F3FF/index.htm)). The emoji character and the skin tone modifier are each represented as a surrogate pair in JavaScript strings.

`spliddit` will split these sequences (4 total code units) into one character even though they consist of two Unicode code points.

## Other functions

### spliddit.hasPair(s)
Tells if `s` contains a surrogate pair.

```javascript
import * as spliddit from '@kiraind/spliddit'

spliddit.hasPair('Look 👀 wow')
// => true
spliddit.hasPair('abcdef')
// => false
```

### spliddit.isFirstOfSurrogatePair(c)
Tells if `c[0]` (the first item in `c`) is the first code unit of a surrogate pair. (Character codes 0xD800 through 0xDFFF)

```javascript
const s = '👴'
const sFirst = s[0]
const sArr = s.split('')

spliddit.isFirstOfSurrogatePair(s)
// => true

spliddit.isFirstOfSurrogatePair(sFirst)
// => true

spliddit.isFirstOfSurrogatePair(sArr)
// => true

spliddit.isFirstOfSurrogatePair(sArr[0])
// => true

spliddit.isFirstOfSurrogatePair('a')
// => false
```
