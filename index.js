#!/usr/bin/env node

// exit right away if we're not in a tty
const
  out = process.stdout
, tty = require('tty')

if (!tty.isatty(out.fd)) { // if !out.isTTY may be same?
  out.write('please run in a tty')
  process.exit(1)
}

// exit if we don't support colour
const terms = /^screen|^xterm|^vt100|color|ansi|cygwin|linux/i
if (!(!!process.env.COLORTERM || terms.test(process.env.TERM))) {
  out.write('please use a terminal that supports colour')
  process.exit(1)
}

const
  fs    = require('fs')
, path  = require('path')
, lame  = require('lame')
, Spkr  = require('speaker')
, mp3   = path.resolve(__dirname, 'mp3.mp3')
, size  = out.getWindowSize()
, pkg   = require('./package.json')
, vers  = () => out.write(`\x1b[33mlolwut version ${pkg.version}\x1b[0m`)
, help  = () => out.write(`\x1b[36m
  lolwut    # run with sound
  lolwut -s # run silently
  lolwut -v # version number
\x1b[0m`)

let width = out.columns

// out.write('\x1B[2J') // don't know?
// out.write('\033c')   // not sure?
out.write('\x1B[2J\x1B[0f') // resets cursor, as well

// clear term and reset width to new size
out.on('resize', () => {
  out.write('\x1B[2J\x1B[0f')
  width = out.columns
})

// generate colours -- see npm.im/rainbowify
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

// the triangles-to-terminal-width thing
const makeAngles = () => {
  let i = 0
  const makeEm = () => {
    out.cursorTo(width)
    i = (i + 1) % width
    const dots = new Array(i + 1).join('▉')
    out.write(col(dots))
  }
  const anglesId = setInterval(makeEm, 100)
  // while (true) {
  // const thirtySecondsFromNow = Date.now() + 300000
  // if (thirtySecondsFromNow <= Date.now()) {
  // return clearInterval(anglesId)
  // }
  // }
}

// the line-to-terminal-width thing
const makeDeco = () => setInterval(() => {
  out.clearLine()
  out.cursorTo(0)
  for (let i = 0; i < width ; i++) {
    out.write(col('▉▊▋▌▍▎▏▎▍▌▋▊▉▊▋▌▍▎▏▎▍▌▋▊'))
    out.write(col('▉▊▋▌▍▎▏▎▍▌▋▊▉▊▋▌▍▎▏▎▍▌▋▊'))
    out.write(col('▉▊▋▌▍▎▏▎▍▌▋▊▉▊▋▌▍▎▏▎▍▌▋▊'))
  }
}, 20000)


const go = () => {
  makeAngles()
  setTimeout(() => makeDeco(), 30000)
  // handle makeAngles and makeLines in here
  // and preferably other nifty functions at some point
}

// handle arguments
if (process.argv[2]) {
  const arg = process.argv[2]
  if (arg === '-h' || arg === '--help') {
    return help()
  }
  if (arg === '-s' || arg === '--silent') {
    return go()
  }
  if (arg === '-v' || arg === '--version') {
    return vers()
  }
} else {
  go()
  fs.createReadStream(mp3)
  .pipe(new lame.Decoder())
  .pipe(new Spkr())
}

// clear stuff
// out.clearLine()
// out.cursorTo(0)
