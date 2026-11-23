// 3Speak retired its studio upload service; videos now go through its embed service with a
// one-time token from actifit-bot. The post must keep the video's permlink (that is how the
// bot links it on 3Speak) and carry 3Speak's mandatory beneficiaries.
import fs from 'fs'
import path from 'path'
import {
  VIDEO_BENEFICIARIES, canAttach, embedUrl, fetchVideoStatus, fromStatus, listUploads, reportSnippet,
  requestUploadToken, statusUrl, stripVideoLinks, videoMetadata, watchUrl, withVideoAtTop, withVideoBeneficiaries,
} from '@/utils/threeSpeakEmbed'

const read = (file) => fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
const json = (body, ok = true, status = 200) => ({ ok, status, json: async () => body })
const EMBED = 'https://play.3speak.tv/embed?v=alice/abc123'

describe('urls', () => {
  it('match the embed service', () => {
    expect(statusUrl('abc123')).toBe('https://embed2.3speak.tv/video/abc123')
    expect(embedUrl('alice', 'abc123')).toBe(EMBED)
    expect(watchUrl('alice', 'abc123')).toBe('https://3speak.tv/watch?v=alice/abc123')
  })
})

describe('post body', () => {
  it('puts the player line first, then the frame as the watch link', () => {
    expect(reportSnippet('alice', 'abc123', EMBED, 'https://usermedia.actifit.io/F')).toBe(
      EMBED + '\n\n[![Watch on 3speak.tv](https://usermedia.actifit.io/F)](https://3speak.tv/watch?v=alice/abc123)')
  })
  it('has a text link without a frame', () => {
    expect(reportSnippet('alice', 'abc123', EMBED, null)).toContain('▶ [Watch on 3speak.tv](')
  })
  it('adds the video above the text, once', () => {
    const once = withVideoAtTop('my workout', 'alice', 'abc123', EMBED, null)
    expect(once.startsWith(EMBED)).toBe(true)
    expect(once.endsWith('my workout')).toBe(true)
    expect(withVideoAtTop(once, 'alice', 'abc123', EMBED, null)).toBe(once)
  })
  it('works on an empty post', () => {
    expect(withVideoAtTop('', 'alice', 'abc123', EMBED, null).startsWith(EMBED)).toBe(true)
  })
})

describe('changing the selected video', () => {
  const A = embedUrl('alice', 'aaa')
  const B = embedUrl('alice', 'bbb')
  const swap = (text, from, to) => withVideoAtTop(
    stripVideoLinks(text, 'alice', from, embedUrl('alice', from)), 'alice', to, embedUrl('alice', to), 'https://f/' + to)

  it('A, B, back to A leaves only A, first, with the text kept', () => {
    let text = withVideoAtTop('my workout', 'alice', 'aaa', A, 'https://f/aaa')
    text = swap(text, 'aaa', 'bbb')
    expect(text).not.toContain(A)
    expect(text.startsWith(B)).toBe(true)
    text = swap(text, 'bbb', 'aaa')
    expect(text).not.toContain(B)
    expect(text).not.toContain('https://f/bbb')
    expect(text.startsWith(A)).toBe(true)
    expect(text.endsWith('my workout')).toBe(true)
  })
  it('a permlink that starts with another is a different video', () => {
    const longer = embedUrl('alice', 'aaa111')
    expect(stripVideoLinks(longer + '\nmine', 'alice', 'aaa', A)).toContain(longer)
    expect(withVideoAtTop(longer, 'alice', 'aaa', A, null).startsWith(A)).toBe(true)
  })
})

describe('videoMetadata', () => {
  it('is one object with the author and permlink frontends build the player from', () => {
    const v = videoMetadata({ owner: 'alice', permlink: 'abc123', embed: EMBED, title: 'T', duration: 8, thumbnailUrl: 'https://f' })
    expect(v).toMatchObject({ platform: '3speak', url: EMBED, reusable: false, thumbnail: 'https://f' })
    expect(v.info).toMatchObject({ platform: '3speak', author: 'alice', permlink: 'abc123', title: 'T', duration: 8 })
    expect(v.info.sourceMap).toEqual([{ type: 'thumbnail', url: 'https://f' }])
  })
  it('leaves out what is unknown', () => {
    const v = videoMetadata({ owner: 'alice', permlink: 'abc123', embed: EMBED, title: '', duration: 0 })
    expect(v.thumbnail).toBeUndefined()
    expect(v.info.duration).toBeUndefined()
    expect(v.info.sourceMap).toEqual([])
  })
})

describe('withVideoBeneficiaries', () => {
  it('always has 3Speak\'s two at their exact weights', () => {
    expect(withVideoBeneficiaries([])).toEqual([
      { account: 'encoder.pay', weight: 100 },
      { account: 'threespeakfund', weight: 1000 },
    ])
  })
  it('a lowered 3Speak weight cannot get through', () => {
    const out = withVideoBeneficiaries([{ account: 'threespeakfund', weight: 1 }, { account: 'encoder.pay', weight: 1 }])
    expect(out).toEqual(VIDEO_BENEFICIARIES)
  })
  it('keeps the user\'s own, sorted as Hive requires, with whole weights', () => {
    const out = withVideoBeneficiaries([{ account: 'zed', weight: 500.00000000001 }, { account: 'bob', weight: 200 }])
    expect(out.map((b) => b.account)).toEqual(['bob', 'encoder.pay', 'threespeakfund', 'zed'])
    expect(out.find((b) => b.account === 'zed').weight).toBe(500)
  })
  it('refuses too many, over 100%, empty weights and duplicates', () => {
    expect(withVideoBeneficiaries([{ account: 'a', weight: 100 }, { account: 'a', weight: 100 }])).toBeNull()
    expect(withVideoBeneficiaries([{ account: 'a', weight: 1 }, { account: 'b', weight: 1 }, { account: 'c', weight: 1 }])).toBeNull()
    expect(withVideoBeneficiaries([{ account: 'a', weight: 9000 }])).toBeNull()
    expect(withVideoBeneficiaries([{ account: 'a', weight: 0 }])).toBeNull()
  })
})

describe('canAttach', () => {
  it('needs 3Speak to have the file, or this browser to have just sent it', () => {
    expect(canAttach('processing', false)).toBe(true)
    expect(canAttach('published', false)).toBe(true)
    expect(canAttach('uploading', true)).toBe(true)
    expect(canAttach('uploading', false)).toBe(false)
    for (const s of ['failed', 'deleted', 'missing', 'posted', '']) expect(canAttach(s, true)).toBe(false)
  })
})

describe('fromStatus', () => {
  const row = { permlink: 'abc123', created: '2026-11-23T10:00:00.000Z' }
  it('reads 3Speak\'s status', () => {
    const v = fromStatus('alice', row, { status: 'processing', encodingProgress: 40, duration: 8, thumbnail_url: 'null', originalFilename: 'a.mp4' })
    expect(v).toMatchObject({ owner: 'alice', status: 'processing', encodingProgress: 40, duration: 8, thumbnail_url: null, title: 'a.mp4', embed_url: EMBED })
  })
  it('an upload 3Speak does not know is missing; unreachable is unknown', () => {
    expect(fromStatus('alice', row, { error: 'Video not found' }).status).toBe('missing')
    expect(fromStatus('alice', row, null).status).toBe('')
  })
})

describe('api calls', () => {
  it('asks our server for a token with the session, never a 3Speak key', async () => {
    const f = jest.fn().mockResolvedValue(json({ token: 't', permlink: 'abc123' }))
    await requestUploadToken('https://api/', 'jwt', f)
    const [url, opts] = f.mock.calls[0]
    expect(url).toBe('https://api/video/uploadToken')
    expect(opts.method).toBe('POST')
    expect(opts.headers['x-acti-token']).toBe('Bearer jwt')
    expect(opts.headers['X-API-Key']).toBeUndefined()
    expect(JSON.parse(opts.body)).toEqual({ short: false })
  })
  it('surfaces each way the server refuses', async () => {
    await expect(requestUploadToken('a/', 'j', async () => json({ error: 'Daily limit' }, false, 429))).rejects.toThrow('Daily limit')
    await expect(requestUploadToken('a/', 'j', async () => json({ success: false, message: 'Token is not valid' }))).rejects.toThrow('Token is not valid')
    await expect(requestUploadToken('a/', 'j', async () => json({ error: 'Authentication failed' }))).rejects.toThrow('Authentication failed')
  })
  it('lists uploads', async () => {
    expect(await listUploads('a/', 'j', async () => json({ uploads: [{ permlink: 'p' }] }))).toEqual([{ permlink: 'p' }])
    expect(await listUploads('a/', 'j', async () => json({}))).toEqual([])
  })
  it('a status check that fails is unknown, not an error', async () => {
    expect(await fetchVideoStatus('p', async () => { throw new Error('down') })).toBeNull()
    expect(await fetchVideoStatus('p', async () => json({ error: 'busy' }, false, 503))).toBeNull()
  })
  it('only a 404 means 3Speak has no such video', async () => {
    const status = await fetchVideoStatus('p', async () => json({ error: 'Video not found' }, false, 404))
    expect(fromStatus('alice', { permlink: 'p' }, status).status).toBe('missing')
  })
})

describe('the site', () => {
  const page = read('pages/_username/videos/new.vue')

  it('no longer uses the retired service or its memo login', () => {
    for (const f of ['pages/_username/videos/new.vue', 'pages/_username/blog/new.vue', 'components/EditPostModal.vue', 'nuxt.config.js']) {
      const src = read(f)
      expect(src).not.toMatch(/uploads\.3speak\.tv|studio\.3speak\.tv|connectSession3S|3s_access_token/)
    }
  })
  it('holds no 3Speak API key', () => {
    expect(page).not.toMatch(/X-API-Key|threespeak_embed_api_key/i)
    expect(read('utils/threeSpeakEmbed.js')).not.toMatch(/X-API-Key/i)
  })
  it('sends the file with the one-time token', () => {
    expect(page).toMatch(/endpoint: ticket\.upload_url/)
    expect(page).toMatch(/Authorization: 'Bearer ' \+ ticket\.token/)
  })
  it('sessions the bot cannot serve, and other chains, stop before a token or a post', () => {
    expect(page).toMatch(/if \(this\.processing \|\| !this\.video \|\| !this\.videoPostingAvailable\(\)\) return;/)
    expect(page).toMatch(/async save\(vid\) \{\s+if \(this\.loading\) return;/)
    expect(page).toMatch(/if \(!this\.videoPostingAvailable\(\)\) return;\s+if \(!vid\) vid = this\.selVid;/)
  })
  it('a late token or finished upload cannot touch a newly chosen file', () => {
    expect(page).toMatch(/if \(run !== this\.uploadRun\) return; \/\/ another file/)
    expect(page).toMatch(/this\.uploadRun \+= 1;/)
  })
  it('never changes the video\'s permlink for the post', () => {
    expect(page).toMatch(/this\.editPost\.permlink = vid\.permlink;/)
    expect(page).not.toMatch(/editPost\.permlink \+=/)
  })
  it('every login method broadcasts the beneficiaries', () => {
    expect(page).toMatch(/const benef = withVideoBeneficiaries\(this\.\$refs\['beneficiaryList'\]\.formattedEntries\)/)
    expect(page).toMatch(/extensions: \[\[0, \{ 'beneficiaries': benef \}\]\]/)
    expect(page).not.toMatch(/\$steemconnect\.comment\(/)
    expect(page).toMatch(/ops\.push\(\[op2, params2\]\)/)
  })
})
