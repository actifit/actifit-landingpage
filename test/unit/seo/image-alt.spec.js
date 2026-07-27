const fs = require('fs')
const path = require('path')

const sourceRoots = ['pages', 'components']

function findVueFiles (directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory()
      ? findVueFiles(entryPath)
      : entry.name.endsWith('.vue') ? [entryPath] : []
  })
}

describe('image alt text', () => {
  it('provides an alt attribute for every image', () => {
    const missingAlt = []

    sourceRoots.flatMap(findVueFiles).forEach(file => {
      const source = fs.readFileSync(file, 'utf8')
      const imageTags = source.match(/<img\b[^>]*>/gi) || []

      imageTags.forEach(tag => {
        if (!/(?:^|\s)(?::)?alt\s*=/.test(tag)) {
          missingAlt.push(`${file}: ${tag}`)
        }
      })
    })

    expect(missingAlt).toEqual([])
  })
})
