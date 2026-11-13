// Browsers and crawlers request /favicon.ico whatever the page links to. Without
// the file every request fell through to a non-cacheable 404 rendered by the app.
const fs = require('fs')
const path = require('path')

describe('static/favicon.ico', () => {
  it('exists and is a Windows icon file', () => {
    const buf = fs.readFileSync(path.join(__dirname, '../../../static/favicon.ico'))
    // ICONDIR header: reserved 0, type 1 (icon), at least one image
    expect(buf.readUInt16LE(0)).toBe(0)
    expect(buf.readUInt16LE(2)).toBe(1)
    expect(buf.readUInt16LE(4)).toBeGreaterThan(0)
  })
})
