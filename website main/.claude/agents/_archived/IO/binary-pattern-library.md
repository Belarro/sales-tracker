# Binary Pattern Library

## IO's Reference Collection of Binary Patterns and Signatures

This library contains pre-analyzed binary patterns, signatures, and templates for quick recognition and translation.

## ASCII Character Reference

### Control Characters (0x00-0x1F)
```
0x00 NUL: 00000000 - Null terminator, end of string
0x08 BS:  00001000 - Backspace, cursor movement
0x09 TAB: 00001001 - Tab character, alignment
0x0A LF:  00001010 - Line feed, newline (Unix)
0x0D CR:  00001101 - Carriage return (Mac/Windows)
0x1B ESC: 00011011 - Escape character, control sequences
```

### Printable Characters (0x20-0x7F)
```
Space:    00100000 - Word separator, breathing room
! (0x21): 00100001 - Excitement, emphasis
" (0x22): 00100010 - Quote boundary, string delimiter
# (0x23): 00100011 - Hash, comment marker, count
$ (0x24): 00100100 - Dollar, variable marker
% (0x25): 00100101 - Percent, modulo, completion
& (0x26): 00100110 - Ampersand, logical AND
' (0x27): 00100111 - Apostrophe, single quote

0-9:      0011xxxx - Numeric digits (pattern: 0011 + 4-bit value)
A-Z:      010xxxxx - Uppercase letters (pattern: 010 + 5-bit value)
a-z:      011xxxxx - Lowercase letters (pattern: 011 + 5-bit value)
```

### Pattern Recognition Shortcuts
```
Numbers:     0011xxxx (48-57 decimal)
Uppercase:   010xxxxx (65-90 decimal)  
Lowercase:   011xxxxx (97-122 decimal)
Punctuation: Mixed patterns, context-dependent
Whitespace:  00001xxx range mostly (8-13 decimal)
```

## UTF-8 Encoding Patterns

### Byte Sequence Identification
```
Single byte (ASCII):     0xxxxxxx
Two-byte sequence:       110xxxxx 10xxxxxx
Three-byte sequence:     1110xxxx 10xxxxxx 10xxxxxx  
Four-byte sequence:      11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
Continuation byte:       10xxxxxx
```

### Common Multi-byte Characters
```
© (Copyright):    11000010 10101001
® (Registered):   11000010 10101110
™ (Trademark):    11100010 10000100 10100010
€ (Euro):         11100010 10000010 10101100
£ (Pound):        11000010 10100011
¥ (Yen):          11000010 10100101
π (Pi):           11001100 10110000
∞ (Infinity):     11100010 10001001 10011110
♥ (Heart):        11100010 10010001 10100101
★ (Star):         11100010 10010110 10000101
```

### Emoji Patterns (4-byte UTF-8)
```
😀 (Grinning):    11110000 10011111 10011000 10000000
😂 (Tears of Joy): 11110000 10011111 10011000 10000010  
❤️ (Red Heart):   11100010 10100100 10100100 + Variation Selector
🔥 (Fire):        11110000 10011111 10010100 10100101
💻 (Laptop):      11110000 10011111 10010010 10111011
🚀 (Rocket):      11110000 10011111 10011010 10000000
```

## Programming Language Signatures

### Python Binary Signatures
```
"def ":      01100100 01100101 01100110 00100000
"class ":    01100011 01101100 01100001 01110011 01110011 00100000
"import ":   01101001 01101101 01110000 01101111 01110010 01110100 00100000
"if ":       01101001 01100110 00100000
"else":      01100101 01101100 01110011 01100101
"return ":   01110010 01100101 01110100 01110101 01110010 01101110 00100000
```

### JavaScript Binary Signatures
```
"function ": 01100110 01110101 01101110 01100011 01110100 01101001 01101111 01101110 00100000
"const ":    01100011 01101111 01101110 01110011 01110100 00100000  
"let ":      01101100 01100101 01110100 00100000
"var ":      01110110 01100001 01110010 00100000
"=>":        00111101 00111110
"console":   01100011 01101111 01101110 01110011 01101111 01101100 01100101
```

### C/C++ Binary Signatures
```
"#include":  00100011 01101001 01101110 01100011 01101100 01110101 01100100 01100101
"int ":      01101001 01101110 01110100 00100000
"void ":     01110110 01101111 01101001 01100100 00100000  
"return ":   01110010 01100101 01110100 01110101 01110010 01101110 00100000
"main":      01101101 01100001 01101001 01101110
"printf":    01110000 01110010 01101001 01101110 01110100 01100110
```

## Data Format Signatures

### JSON Binary Patterns
```
'{':         01111011 - Object start
'}':         01111101 - Object end  
'[':         01011011 - Array start
']':         01011101 - Array end
'"':         00100010 - String delimiter
':':         00111010 - Key-value separator
',':         00101100 - Element separator
"null":      01101110 01110101 01101100 01101100
"true":      01110100 01110010 01110101 01100101
"false":     01100110 01100001 01101100 01110011 01100101
```

### XML Binary Patterns
```
'<':         00111100 - Tag start
'>':         00111110 - Tag end
'</':        00111100 00101111 - Closing tag start
'/>':        00101111 00111110 - Self-closing tag end
'<!--':      00111100 00100001 00101101 00101101 - Comment start
'-->':       00101101 00101101 00111110 - Comment end
```

### CSV Binary Patterns
```
',':         00101100 - Field separator
'"':         00100010 - Field quote (when containing separator)
'\n':        00001010 - Record separator (Unix)
'\r\n':      00001101 00001010 - Record separator (Windows)
```

## Numerical Representations

### Integer Representations
```
8-bit signed (-128 to 127):
  -1:        11111111 (two's complement)
  0:         00000000
  1:         00000001
  127:       01111111
  -128:      10000000

16-bit signed (-32,768 to 32,767):
  -1:        11111111 11111111
  256:       00000001 00000000 (little-endian)
  256:       00000000 00000001 (big-endian)
```

### Floating Point (IEEE 754)
```
32-bit float structure: SEEEEEEE EMMMMMMM MMMMMMMM MMMMMMMM
  S = Sign bit (1 bit)
  E = Exponent (8 bits, biased by 127)
  M = Mantissa/Fraction (23 bits)

Examples:
  0.0:       00000000 00000000 00000000 00000000
  1.0:       00111111 10000000 00000000 00000000  
  -1.0:      10111111 10000000 00000000 00000000
  2.0:       01000000 00000000 00000000 00000000
  0.5:       00111111 00000000 00000000 00000000
  π ≈ 3.14159: 01000000 01001001 00001111 11011011
```

### Special Float Values
```
+Infinity:   01111111 10000000 00000000 00000000
-Infinity:   11111111 10000000 00000000 00000000  
NaN:         01111111 1xxxxxxx xxxxxxxx xxxxxxxx (x != all 0)
```

## Color Representations

### RGB Color Patterns
```
24-bit RGB (R=8bits, G=8bits, B=8bits):
  Black:     00000000 00000000 00000000
  White:     11111111 11111111 11111111
  Red:       11111111 00000000 00000000
  Green:     00000000 11111111 00000000
  Blue:      00000000 00000000 11111111
  Yellow:    11111111 11111111 00000000
  Cyan:      00000000 11111111 11111111
  Magenta:   11111111 00000000 11111111
```

### Hexadecimal Color to Binary
```
#FF0000 (Red):     11111111 00000000 00000000
#00FF00 (Green):   00000000 11111111 00000000  
#0000FF (Blue):    00000000 00000000 11111111
#FFFFFF (White):   11111111 11111111 11111111
#000000 (Black):   00000000 00000000 00000000
```

## Audio/Media Patterns

### WAV File Header Signature
```
"RIFF": 01010010 01001001 01000110 01000110
"WAVE": 01010111 01000001 01010110 01000101
"fmt ": 01100110 01101101 01110100 00100000
"data": 01100100 01100001 01110100 01100001
```

### Image Format Signatures
```
PNG:  10001001 01010000 01001110 01000111 00001101 00001010 00011010 00001010
JPEG: 11111111 11011000 11111111 11100000
GIF:  01000111 01001001 01000110 (GIF)
BMP:  01000010 01001101 (BM)
```

## Compression Patterns

### Common Compression Signatures
```
ZIP:   01010000 01001011 (PK)
GZIP:  00011111 10001011 (0x1F 0x8B)  
BZIP2: 01000010 01011010 01101000 (BZh)
7Z:    00110111 01111010 10111100 10101111 00100111 00011100
```

## Network Protocol Patterns

### HTTP Binary Signatures
```
"GET ":    01000111 01000101 01010100 00100000
"POST ":   01010000 01001111 01010011 01010100 00100000
"HTTP/":   01001000 01010100 01010100 01010000 00101111
"200 OK":  00110010 00110000 00110000 00100000 01001111 01001011
```

### Email Protocol Patterns  
```
"From: ":     01000110 01110010 01101111 01101101 00111010 00100000
"To: ":       01010100 01101111 00111010 00100000
"Subject: ":  01010011 01110101 01100010 01101010 01100101 01100011 01110100 00111010 00100000
```

## Mathematical Constants in Binary

### Famous Mathematical Constants
```
π (3.14159...):    IEEE 754: 01000000 01001001 00001111 11011011
e (2.71828...):    IEEE 754: 01000000 00101101 11110111 10111011  
φ (1.61803...):    IEEE 754: 00111111 11001111 00010011 11000010
√2 (1.41421...):   IEEE 754: 00111111 10110101 00010000 10111101
```

## Pattern Beauty Examples

### Palindromic Binary
```
"A":       01000001 (not palindromic)
"AHA":     01000001 01001000 01000001 (A-pattern symmetry)
101:       01101001 (binary 101 in ASCII)
```

### Mathematical Beauty
```
Powers of 2 in binary:
1:    00000001
2:    00000010  
4:    00000100
8:    00001000
16:   00010000
32:   00100000
64:   01000000
128:  10000000
```

### Fibonacci in Binary
```
1:     00000001
1:     00000001
2:     00000010
3:     00000011
5:     00000101
8:     00001000
13:    00001101
21:    00010101
```

## Translation Quality Patterns

### High-Quality Translation Indicators
- Consistent encoding scheme throughout
- Proper handling of multi-byte sequences
- Preservation of data boundaries
- Clear pattern structure and explanation
- Cultural and contextual awareness

### Red Flag Patterns
- Mixed encoding within same text
- Broken multi-byte sequences
- Lost whitespace or formatting
- Missing context or meaning
- Inconsistent bit ordering

---

This library serves as IO's quick-reference guide for pattern recognition and high-quality binary translation across diverse domains and contexts.