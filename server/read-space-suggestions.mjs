// Author only. Reads local files, exposes no network endpoint, and never touches the source website.
import { link, mkdir, open, opendir, readFile, unlink } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { spaceSuggestionsDir } from './space-suggestions.mjs'

const args = process.argv.slice(2)
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const exporting=args[0]==='--export-image' && args.length===2 && uuid.test(args[1])
if (!exporting && args.length && (args.length !== 2 || args[0] !== '--limit' || !/^[1-9]\d{0,2}$/.test(args[1]))) {
  console.error('Usage: node server/read-space-suggestions.mjs [--limit 1..999 | --export-image RECEIPT_UUID]')
  process.exitCode = 2
} else {
  const limit = Number(args[1] || 20)
  const dir = spaceSuggestionsDir()
  const newest = []
  let found=false
  try {
    const entries = await opendir(dir)
    for await (const e of entries) {
      if (!e.isFile() || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.json$/.test(e.name)) continue
      const record = JSON.parse(await readFile(join(dir,e.name), 'utf8'))
      if (exporting) {
        if (record.id !== args[1]) continue
        if (!record.suggestion?.image || typeof record.attachmentBase64 !== 'string') {
          console.error('This receipt has no screenshot.'); process.exitCode=1; found=true; break
        }
        const image=Buffer.from(record.attachmentBase64,'base64')
        const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
        if (digest(image)!==record.suggestion.image.sha256) throw new Error('Image failed integrity check')
        const folder=join(dir,'exports')
        await mkdir(folder,{recursive:true,mode:0o700})
        const path=join(folder,record.id+'.jpg'), temp=join(folder,'.'+randomUUID()+'.tmp')
        const h=await open(temp,'wx',0o600)
        try {
          try { await h.writeFile(image); await h.sync() } finally { await h.close() }
          try { await link(temp,path) } catch (err) {
            if (err.code!=='EEXIST' || digest(await readFile(path))!==record.suggestion.image.sha256) throw err
          }
        } finally { await unlink(temp).catch(()=>{}) }
        console.log(path); found=true; break
      }
      delete record.attachmentBase64
      newest.push(record)
      newest.sort((a,b) => String(b.receivedAt).localeCompare(String(a.receivedAt)) || String(a.id).localeCompare(String(b.id)))
      if (newest.length > limit) newest.pop()
    }
  } catch (e) {
    if (e.code !== 'ENOENT') { console.error('Could not read the inbox. Check the private directory, file format and permissions.'); process.exitCode = 1 }
  }
  // JSON.stringify quotes embedded newlines/ANSI ESC; also escape C1, bidi controls and Unicode line separators.
  for (const row of newest) {
    console.log(JSON.stringify(row).replace(/[\u007f-\u009f\u2028-\u202e\u2066-\u2069]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4,'0')))
  }
  if (exporting && !found && !process.exitCode) {console.error('Receipt not found.');process.exitCode=1}
  else if (!exporting && !newest.length && !process.exitCode) console.error('Inbox empty.')
}
