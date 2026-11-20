// Standalone listener in production, identical middleware in Vite. No database or npm dependencies.
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { existsSync, realpathSync } from 'node:fs'
import { link, mkdir, open, readFile, unlink } from 'node:fs/promises'
import { createServer } from 'node:http'
import { isIP } from 'node:net'
import { homedir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const chapters = new Set(['opening', 'dfh', 'launch', 'tiangong', 'moon', 'beidou', 'fast', 'closing'])
const paths = new Set(['/api/space-suggestions', '/china-military/api/space-suggestions'])
const uuidV4 = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i
const maxImage = 1024 * 1024
const maxBody = 4 * Math.ceil(maxImage / 3) + 24 * 1024
const hash = s => createHash('sha256').update(s).digest()
// Shared invitation only. Override via the server environment; never embed it in a client build.
const tokenLife = 1800
const cleanControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/
const bad = (status, code) => Object.assign(new Error(code), { status, code })
const exactKeys = (obj, allowed) => obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).every(k => allowed.includes(k))
const validText = (s, min, max) => typeof s === 'string' && s.trim().length >= min && s.trim().length <= max && !cleanControls.test(s)

function canonical(path) {
  const full = resolve(path)
  // Resolve existing junctions/symlinks even if a new inbox directory does not exist yet.
  if (existsSync(full) || full === dirname(full)) return realpathSync(full)
  return join(canonical(dirname(full)), basename(full))
}

export function spaceSuggestionsDir(dir = process.env.SPACE_SUGGESTIONS_DIR || join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'earth-force', 'space-suggestions')) {
  // An imported Vite module may be bundled in node_modules/.vite-temp; use cwd as a second guard.
  const roots = [fileURLToPath(new URL('../', import.meta.url))]
  if (existsSync(join(process.cwd(), 'src', 'journey', 'space'))) roots.push(process.cwd())
  const target = canonical(dir)
  for (const root of roots) {
    // Do not assume cwd is the repository (systemd may set it to /).
    if (root === resolve(root, '..')) continue
    const rel = relative(canonical(root), target)
    if (rel === '' || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel))) {
      throw new Error('Choose a private SPACE_SUGGESTIONS_DIR outside the application and its web root.')
    }
  }
  return target
}

// Restrict attachments to baseline, single-scan, 8-bit JPEGs emitted by browser canvas.
// Do not retain arbitrary APP/COM payloads (including EXIF, thumbnails or profiles),
// a trailing payload, arbitrary file names, vector markup, or a separate unredacted layer.
function screenshot(value) {
  const fail = () => { throw bad(422, 'invalid_image') }
  const prefix = 'data:image/jpeg;base64,'
  if (typeof value !== 'string' || !value.startsWith(prefix)) fail()
  const text = value.slice(prefix.length)
  if (text.length > 4 * Math.ceil(maxImage / 3)) throw bad(413,'too_large')
  if (!text.length || text.length % 4 || /[^A-Za-z0-9+/=]/.test(text)) fail()
  const src = Buffer.from(text, 'base64')
  if (src.length > maxImage) throw bad(413, 'too_large')
  if (src.toString('base64') !== text || src.length < 50 || src.readUInt16BE(0) !== 0xffd8) fail()
  let p = 2, width = 0, height = 0, components = 0, quant = false, huff = false
  const kept = [src.subarray(0,2)]
  while (p+3 < src.length) {
    const start = p
    if (src[p++] !== 0xff) fail()
    while (src[p] === 0xff) p++
    const marker = src[p++]
    if (p+2 > src.length) fail()
    const size = src.readUInt16BE(p), end = p + size
    if (size < 2 || end > src.length) fail()
    if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe) { p = end; continue }
    if (marker === 0xdb) {
      for (let i=p+2; i<end;) {
        if (src[i] > 3 || i+65 > end) fail()
        i += 65
      }
      if (size === 2) fail()
      quant = true
    } else if (marker === 0xc4) {
      for (let i=p+2; i<end;) {
        if (i+17 > end || ![0,1,2,3,16,17,18,19].includes(src[i++])) fail()
        let count=0
        for (let j=0;j<16;j++) count+=src[i++]
        if (!count || count>256 || i+count>end) fail()
        i+=count
      }
      if (size === 2) fail()
      huff = true
    } else if (marker === 0xdd) {
      if (size !== 4) fail()
    } else if (marker === 0xc0) {
      if (width || size<11 || src[p+2]!==8) fail()
      height=src.readUInt16BE(p+3); width=src.readUInt16BE(p+5); components=src[p+7]
      if (![1,3].includes(components) || size!==8+3*components || !width || !height ||
          width>8192 || height>8192 || width*height>16777216) fail()
    } else if (marker === 0xda) {
      if (!width || !quant || !huff || size!==6+2*components || src[p+2]!==components ||
          !src.subarray(end-3,end).equals(Buffer.from([0,63,0]))) fail()
      for (let i=end; i < src.length-1; i++) {
        if (src[i] !== 0xff) continue
        const next=src[++i]
        if (next===0 || (next>=0xd0 && next<=0xd7)) continue
        if (next!==0xd9 || i!==src.length-1 || i<=end+1) fail()
        kept.push(src.subarray(start))
        const clean = Buffer.concat(kept)
        return {meta:{mimeType:'image/jpeg',width,height,bytes:clean.length,sha256:hash(clean).toString('hex')},base64:clean.toString('base64')}
      }
      fail()
    } else fail()
    kept.push(src.subarray(start,end)); p=end
  }
  fail()
}

function validate(doc) {
  const fail = () => { throw bad(422, 'invalid_suggestion') }
  if (!exactKeys(doc, ['requestId','chapterId','lang','anchor','category','message','sourceUrl','image'])
      || typeof doc.requestId !== 'string' || !uuidV4.test(doc.requestId) || !chapters.has(doc.chapterId)
      || !['zh','en'].includes(doc.lang) || !['correction','addition','other'].includes(doc.category)
      || !validText(doc.message, doc.image !== undefined ? 0 : 5, 1500)) fail()
  const a = doc.anchor
  if (!exactKeys(a, ['kind','paragraphIndex','quote']) || !['title','summary','paragraph','image'].includes(a.kind)) fail()
  // All eight current chapters have two bilingual narration paragraphs. Keep in sync when chapters grow.
  if (a.kind === 'paragraph' ? ![0,1].includes(a.paragraphIndex) : a.paragraphIndex !== undefined) fail()
  if (a.quote !== undefined && !validText(a.quote, 0, 500)) fail()
  let sourceUrl
  if (doc.sourceUrl !== undefined && doc.sourceUrl !== '') {
    if (!validText(doc.sourceUrl, 1, 2048)) fail()
    try {
      const u = new URL(doc.sourceUrl.trim())
      if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || !/^https?:\/\//i.test(doc.sourceUrl.trim())) fail()
      sourceUrl = u.href // stored as a reference only; the service never fetches links
    } catch { fail() }
  }
  const image = doc.image === undefined ? undefined : screenshot(doc.image)
  const suggestion = { chapterId: doc.chapterId, lang: doc.lang, anchor: {kind: a.kind,
    ...(a.kind === 'paragraph' ? {paragraphIndex: a.paragraphIndex} : {}), ...(a.quote?.trim() ? {quote: a.quote.trim()} : {})},
    category: doc.category, message: doc.message.trim(), ...(sourceUrl ? {sourceUrl} : {}), ...(image ? {image:image.meta} : {}) }
  return {suggestion,image}
}

function readBody(req, limit) {
  if (Number(req.headers['content-length']) > limit) { req.resume(); throw bad(413, 'too_large') }
  return new Promise((done, reject) => {
    const chunks = []
    let size = 0
    req.on('error', reject)
    req.on('aborted', () => reject(bad(400, 'incomplete_body')))
    req.on('data', chunk => {
      size += chunk.length
      if (size > limit) { chunks.length = 0; reject(bad(413, 'too_large')); return }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (size > limit) return
      try { done(JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(Buffer.concat(chunks)))) }
      catch { reject(bad(400, 'invalid_json')) }
    })
  })
}

function json(res, status, body, extra = {}) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff', ...extra})
  res.end(JSON.stringify(body))
}

// Bounded, process-local coarse limits. IPs are only kept in RAM for the current time window.
function limiter(windowMs, ipLimit, totalLimit, clock = Date.now) {
  let until = 0, total = 0
  const ips = new Map()
  return (key, cost = 1, consume = true) => {
    const now = clock()
    if (now >= until) { until = now + windowMs; total = 0; ips.clear() }
    const n = ips.get(key) || 0
    if (n+cost > ipLimit || total+cost > totalLimit) throw Object.assign(bad(429, 'rate_limited'),{retryAfter:Math.max(1, Math.ceil((until-now)/1000))})
    if (consume) {ips.set(key, n+cost); total+=cost}
  }
}

const receiptFor = async (file, suggestion) => {
  let raw
  try { raw = await readFile(file, 'utf8') } catch (e) { if (e.code === 'ENOENT') return null; throw e }
  const prior = JSON.parse(raw)
  if (JSON.stringify(prior.suggestion) !== JSON.stringify(suggestion)) throw bad(409, 'request_conflict')
  return prior.id
}

export function createSpaceSuggestionsMiddleware(options = {}) {
  const dir = spaceSuggestionsDir(options.dataDir)
  const attempts = limiter(60000, 60, 1000)
  const writes = limiter(600000, options.ipLimit ?? 12, 400)
  const uploadBytes = limiter(600000, 12*maxImage, 64*maxImage)
  const failedCodes = limiter(600000, options.unlockLimit ?? 12, 500, options.now)
  const secret = randomBytes(32)
  const configured = options.passcode ?? process.env.SPACE_SUGGESTIONS_PASSCODE
  if (configured !== undefined && (!configured.length || Buffer.byteLength(configured)>128)) throw new Error('Invalid server passcode configuration.')
  const codeHash = configured === undefined ? null : hash(configured)
  const clock=options.now ?? Date.now
  const sign=(prefix, host)=>createHmac('sha256',secret).update(host+'|'+prefix).digest()
  function authorized(auth, host) {
    const m=typeof auth==='string' && /^Bearer ([a-f0-9]{32}\.[0-9]{10})\.([a-f0-9]{64})$/.exec(auth)
    return m && Number(m[1].split('.')[1])>Math.floor(clock()/1000) && timingSafeEqual(sign(m[1],host),Buffer.from(m[2],'hex'))
  }
  const trust = options.trustLocalProxy ?? (process.env.SPACE_SUGGESTIONS_TRUST_PROXY === '1')
  return async function receive(req, res, next) {
    const path=(req.url || '').split('?')[0]
    const unlocking=path.endsWith('/unlock') && paths.has(path.slice(0,-7))
    if (!unlocking && !paths.has(path)) return next()
    if (!codeHash) return json(res, 503, {ok:false,error:'inbox_not_configured'})
    try {
      if (req.method !== 'POST') return json(res, 405, {ok:false,error:'method_not_allowed'}, {Allow:'POST'})
      let ip = req.socket.remoteAddress || 'unknown'
      const realIP = req.headers['x-real-ip']
      const fromProxy=trust && ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(ip)
      if (fromProxy && typeof realIP === 'string' && isIP(realIP)) ip = realIP
      attempts(ip)
      const host=(req.headers.host || '').toLowerCase()
      const forwarded=req.headers['x-forwarded-proto']
      const protocol=fromProxy && (forwarded==='http'||forwarded==='https') ? forwarded : req.socket.encrypted?'https':'http'
      if (req.headers['sec-fetch-site']==='cross-site') throw bad(403,'origin_rejected')
      const origin = req.headers.origin
      if (origin) {
        let u
        try { u = new URL(origin) } catch { throw bad(403, 'origin_rejected') }
        if (u.host.toLowerCase() !== host || u.protocol!==protocol+':') throw bad(403, 'origin_rejected')
      }
      if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw bad(415, 'json_required')
      if (unlocking) {
        failedCodes(ip,1,false)
        const doc=await readBody(req,1024)
        // Recheck after reading, in case another concurrent attempt exhausted the window.
        failedCodes(ip,1,false)
        if (!exactKeys(doc,['passcode']) || typeof doc.passcode!=='string' || Buffer.byteLength(doc.passcode)>128 ||
            !timingSafeEqual(hash(doc.passcode),codeHash)) {
          failedCodes(ip)
          throw bad(401,'invalid_passcode')
        }
        const prefix=randomBytes(16).toString('hex')+'.'+(Math.floor(clock()/1000)+tokenLife)
        return json(res,200,{ok:true,token:prefix+'.'+sign(prefix, host).toString('hex'),expiresIn:tokenLife})
      }
      if (!authorized(req.headers.authorization,host)) {req.resume();throw bad(401,'unlock_required')}
      const doc = await readBody(req,maxBody)
      const {suggestion,image} = validate(doc)
      const file = join(dir, doc.requestId.toLowerCase() + '.json')
      const existing = await receiptFor(file, suggestion)
      if (existing) return json(res, 200, {ok:true,id:existing})
      writes(ip)
      if (image) uploadBytes(ip, image.meta.bytes)
      await mkdir(dir, {recursive:true,mode:0o700})
      const id = randomUUID()
      const tmp = join(dir, '.' + id + '.tmp')
      const h = await open(tmp, 'wx', 0o600)
      try {
        try {
          await h.writeFile(JSON.stringify({schema:image?2:1,id,receivedAt:new Date().toISOString(),journey:'space',suggestion,
            ...(image ? {attachmentBase64:image.base64} : {})}) + '\n', 'utf8')
          await h.sync()
        } finally { await h.close() }
        // An immutable, complete file becomes visible at once. A simultaneous retry cannot overwrite the winner.
        try { await link(tmp, file) } catch (e) {
          if (e.code !== 'EEXIST') throw e
          const prior = await receiptFor(file, suggestion)
          if (!prior) throw new Error('receipt unavailable')
          return json(res, 200, {ok:true,id:prior})
        }
      } finally { await unlink(tmp).catch(() => {}) }
      return json(res, 201, {ok:true,id})
    } catch (e) {
      if (res.destroyed || res.writableEnded) return
      const status = e.status || 503
      return json(res, status, {ok:false,error:e.status ? e.code : 'storage_unavailable'}, status === 429 ? {'Retry-After':String(e.retryAfter ?? 600)} : {})
    }
  }
}

if (process.argv[1] && existsSync(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const handler = createSpaceSuggestionsMiddleware()
  const port = Number(process.env.SPACE_SUGGESTIONS_PORT || 4387)
  createServer({requestTimeout:15000, headersTimeout:10000}, (req,res) => {
    handler(req,res,() => json(res,404,{ok:false,error:'not_found'}))
  }).listen(port,'127.0.0.1',() => console.log('Space suggestion inbox listening on 127.0.0.1:' + port))
}
