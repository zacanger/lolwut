#!/usr/bin/env node

const
  fs    = require('fs')
, path  = require('path')
, lame  = require('lame')
, Spkr  = require('speaker')
, mp3   = path.resolve(__dirname, 'mp3.mp3')
, out   = process.stdout
, width = out.columns

out.write('\033c')

function gencolours() {
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

let i = 0
setInterval(() => {
  out.cursorTo(width)
  i = (i + 1) % width
  const dots = new Array(i + 1).join('.')
  out.write(col(dots))
}, 100)

fs.createReadStream(mp3)
.pipe(new lame.Decoder())
.on('format', function (format) {
  this.pipe(new Spkr(format))
})
