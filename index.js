#!/usr/bin/env node

const
  out   = process.stdout
, tty   = require('tty')

if (!tty.isatty(out.fd)) { // if !out.isTTY may be same?
  out.write('please run in a tty')
  process.exit(1)
}

const
  fs    = require('fs')
, path  = require('path')
, lame  = require('lame')
, Spkr  = require('speaker')
, mp3   = path.resolve(__dirname, 'mp3.mp3')
, size  = out.getWindowSize()
, v     = require('./package.json').version

let width = out.columns

// out.write('\x1B[2J') // don't know?
// out.write('\033c')   // not sure?
out.write('\x1B[2J\x1B[0f') // resets cursor, as well

out.on('resize', () => {
  out.write('\x1B[2J\x1B[0f')
  width = out.columns
})

const gencolours = () => {
  const colours = []
  for (let i = 0; i < (6 * 7); i++) {
    const
      pi3 = Math.floor(Math.PI / 3)
    , n   = (i * (1.0 / 6))
    , r   = Math.floor(3 * Math.sin(n) + 3)
    , g   = Math.floor(3 * Math.sin(n + 2 * pi3) + 3)
    , b   = Math.floor(3 * Math.sin(n + 4 * pi3) + 3)
    colours.push(36 * r + 6 * g + b + 16)
  }
  return colours
}

const rainbowColours = gencolours()

let colourIndex = 0

const col = str => {
  const colour = rainbowColours[colourIndex % rainbowColours.length]
  colourIndex += 1
  return `\u001b[38;5;${colour}m${str}\u001b[0m`
}

const go = () => {
  let i = 0
  setInterval(() => {
    out.cursorTo(width)
    i = (i + 1) % width
    const dots = new Array(i + 1).join('\\')
    out.write(col(dots))
  }, 100)
}

const help = () =>
  out.write(`\x1b[36m
  lolwut    # run with sound
  lolwut -s # run silently
  lolwut -v # version number
\x1b[0m`)

const version = () =>
  out.write(`\x1b[33mlolwut version ${v}\x1b[0m`)

if (process.argv[2]) {
  const arg = process.argv[2]
  if (arg === '-h' || arg === '--help') {
    return help()
  }
  if (arg === '-s' || arg === '--silent') {
    return go()
  }
  if (arg === '-v' || arg === '--version') {
    return version()
  }
} else {
  go()
  fs.createReadStream(mp3)
  .pipe(new lame.Decoder())
  .pipe(new Spkr())
}
