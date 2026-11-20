import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { createSpaceSuggestionsMiddleware, spaceSuggestionsDir } from './space-suggestions.mjs'

const fixture = () => ({requestId:randomUUID(), chapterId:'moon', lang:'zh', anchor:{kind:'paragraph',paragraphIndex:1,quote:'装着月背样品的返回器'},
  category:'correction', message:'建议交代此处返回器的着陆日期来源。', sourceUrl:'https://www.cnsa.gov.cn/'})
const testCode='separate-test-fixture'
const smallJpeg='/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAQABgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAQG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmANGuAAf/9k='

async function harness(t, opts = {}) {
  const parent = await mkdtemp(join(tmpdir(),'space-suggestion-test-'))
  const dataDir = join(parent,'private')
  const handle = createSpaceSuggestionsMiddleware({dataDir,passcode:testCode,...opts})
  const server = createServer((req,res) => handle(req,res,() => {res.writeHead(404);res.end()}))
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
  t.after(async () => {
    await new Promise(resolve => {server.close(resolve);server.closeAllConnections()})
    await rm(parent,{recursive:true,force:true})
  })
  const base = 'http://127.0.0.1:' + server.address().port
  const url = base+'/china-military/api/space-suggestions'
  const raw = (data, headers = {}, target = url) => fetch(target,{method:'POST',
    headers:{'Content-Type':'application/json','Origin':base,...headers},body: typeof data === 'string' ? data : JSON.stringify(data)})
  const unlock=await raw({passcode:testCode},{},url+'/unlock')
  assert.equal(unlock.status,200)
  const {token}=await unlock.json()
  const post=(data,headers={},target=url)=>raw(data,{Authorization:'Bearer '+token,...headers},target)
  return {dataDir,base,url,post,raw,token}
}

test('both mounts accept private suggestions; no HTTP read/list or fabricated client fields', async t => {
  const {dataDir,base,url,post} = await harness(t)
  const payload = fixture()
  const saved = await post(payload)
  assert.equal(saved.status,201)
  const body = await saved.json()
  assert.deepEqual(Object.keys(body).sort(),['id','ok'])
  assert.equal(body.ok,true)
  const names = await readdir(dataDir)
  assert.deepEqual(names,[payload.requestId+'.json'])
  const record = JSON.parse(await readFile(join(dataDir,names[0]),'utf8'))
  assert.equal(record.id,body.id)
  assert.equal(record.journey,'space')
  const {requestId,...suggestion} = payload
  assert.deepEqual(record.suggestion,suggestion)
  assert.ok(Number.isFinite(Date.parse(record.receivedAt)))
  assert.ok(!('ip' in record))
  if (process.platform !== 'win32') assert.equal((await stat(join(dataDir,names[0]))).mode & 0o777,0o600)
  let r = await fetch(url)
  assert.equal(r.status,405)
  assert.equal(r.headers.get('allow'),'POST')
  assert.equal((await fetch(url+'/'+names[0])).status,404)
  assert.equal((await post({...fixture(),status:'accepted'})).status,422)
  r = await post(fixture(),{},base+'/api/space-suggestions')
  assert.equal(r.status,201)
})

test('simultaneous retries and new middleware after restart reuse receipt; payload conflicts cannot overwrite', async t => {
  const {dataDir,base,url,post} = await harness(t)
  const payload = fixture()
  const a = await Promise.all(Array.from({length:5},() => post(payload)))
  assert.deepEqual(a.map(r=>r.status).sort(),[200,200,200,200,201])
  const receipts = await Promise.all(a.map(r=>r.json()))
  assert.equal(new Set(receipts.map(r=>r.id)).size,1)
  assert.equal((await post({...payload,message:'different text'})).status,409)
  // Simulate a fresh process against the original durable directory.
  const handle = createSpaceSuggestionsMiddleware({dataDir,passcode:testCode})
  const other = createServer((req,res)=>handle(req,res,()=>{res.end()}))
  await new Promise(resolve=>other.listen(0,'127.0.0.1',resolve))
  try {
    const next = 'http://127.0.0.1:'+other.address().port
    const target=url.replace(base,next)
    assert.equal((await post(payload,{Origin:next},target)).status,401)
    const auth=await post({passcode:testCode},{Origin:next},target+'/unlock')
    const r=await post(payload,{Origin:next,Authorization:'Bearer '+(await auth.json()).token},target)
    assert.equal(r.status,200)
    assert.deepEqual(await r.json(),receipts[0])
  } finally {await new Promise(resolve=>{other.close(resolve);other.closeAllConnections()})}
  assert.equal((await readdir(dataDir)).length,1)
})

test('strict input bounds, same-origin JSON only; invalid requests leave no files',async t => {
  const {post,dataDir} = await harness(t)
  for (const partial of [{requestId:'../outside'}, {chapterId:'no-chapter'}, {lang:'fr'}, {category:'publish'},
    {anchor:{kind:'paragraph'}},{anchor:{kind:'paragraph',paragraphIndex:2}},{anchor:{kind:'title',paragraphIndex:0}},
    {anchor:{kind:'image',quote:'x'.repeat(501)}},{message:'太短'},{message:'x'.repeat(1501)}, {message:'invalid\x1btext'},
    {sourceUrl:'file:///etc/passwd'},{sourceUrl:'https://name:password@example.com/'}]) {
    const r=await post({...fixture(),...partial});assert.equal(r.status,422,JSON.stringify(partial))
  }
  assert.equal((await post('{')).status,400)
  assert.equal((await post('x'.repeat(1450000))).status,413)
  assert.equal((await post(fixture(),{'Content-Type':'text/plain'})).status,415)
  assert.equal((await post(fixture(),{Origin:'https://example.org'})).status,403)
  await assert.rejects(readdir(dataDir), {code:'ENOENT'})
})

test('shared-code gate, scope, fixed expiry and bounded unlock attempts; credentials not stored', async t => {
  let now=Date.now()
  const {raw,post,url,base,dataDir,token}=await harness(t,{unlockLimit:3,now:()=>now})
  assert.equal((await raw(fixture())).status,401)
  assert.equal((await raw(fixture(),{Authorization:'Bearer '+token.replace(/.$/, c=>c==='0'?'1':'0')})).status,401)
  assert.equal((await raw({passcode:testCode},{Origin:'https://foreign.example'},url+'/unlock')).status,403)
  assert.equal((await raw({passcode:testCode},{Origin:base.replace('http:', 'https:')},url+'/unlock')).status,403)
  assert.equal((await raw({passcode:'bad'},{},url+'/unlock')).status,401)
  assert.equal((await raw({passcode:testCode},{},base+'/api/space-suggestions/unlock')).status,200)
  assert.equal((await raw({passcode:'bad'},{},url+'/unlock')).status,401)
  assert.equal((await post(fixture())).status,201)
  const contents=await readFile(join(dataDir,(await readdir(dataDir))[0]),'utf8')
  assert.ok(!contents.includes(token) && !contents.includes(testCode))
  now+=1800000
  assert.equal((await post(fixture())).status,401)
})

test('successful re-entry costs no small lockout quota; exhausted code failures lock until the window renews', async t=>{
  let now=Date.now()
  const {raw,url}=await harness(t,{unlockLimit:2,now:()=>now})
  const attempt=code=>raw({passcode:code},{},url+'/unlock')
  for(let i=0;i<15;i++) assert.equal((await attempt(testCode)).status,200)
  assert.equal((await attempt('wrong')).status,401)
  assert.equal((await attempt(testCode)).status,200)
  assert.equal((await attempt('wrong')).status,401)
  for(const code of [testCode,'wrong']){
    const result=await attempt(code);assert.equal(result.status,429);assert.equal(result.headers.get('Retry-After'),'600')
  }
  now+=599999
  assert.equal((await attempt(testCode)).status,429)
  now++
  assert.equal((await attempt(testCode)).status,200)
})

test('screenshot-only and short comments; one immutable receipt; CLI exports private sanitized JPEG', async t => {
  const {dataDir,post,base}=await harness(t)
  const payload={...fixture(),message:'',image:'data:image/jpeg;base64,'+smallJpeg}
  const accepted=await post(payload)
  assert.equal(accepted.status,201)
  const {id}=await accepted.json()
  const repeat=await post(payload);assert.equal(repeat.status,200);assert.equal((await repeat.json()).id,id)
  assert.equal((await post({...payload,message:'多谢'})).status,409)
  assert.equal((await post({...payload,requestId:randomUUID(),message:'建议'})).status,201)
  const row=JSON.parse(await readFile(join(dataDir,payload.requestId+'.json'),'utf8'))
  assert.equal(row.suggestion.image.width,24);assert.equal(row.suggestion.image.height,16)
  const run=args=>execFileSync(process.execPath,[fileURLToPath(new URL('./read-space-suggestions.mjs',import.meta.url)),...args],{encoding:'utf8',env:{...process.env,SPACE_SUGGESTIONS_DIR:dataDir}}).trim()
  assert.ok(!run(['--limit','20']).includes('attachmentBase64'))
  const path=run(['--export-image',id])
  assert.equal(path,join(dataDir,'exports',id+'.jpg'))
  assert.equal(run(['--export-image',id]),path)
  const bytes=await readFile(path)
  assert.equal(bytes.toString('base64'),row.attachmentBase64)
  assert.equal(bytes.indexOf('JFIF'),-1)
  assert.equal((await fetch(base+'/api/space-suggestions/exports/'+id+'.jpg')).status,404)
})

test('reject non-JPEG, invalid syntax, trailers and excess attachment bytes without a receipt',async t=>{
  const {post,dataDir}=await harness(t)
  for(const image of ['data:image/svg+xml;base64,PHN2Zy8+','data:image/jpeg;base64,PHN2Zy8+',
      'data:image/jpeg;base64,'+Buffer.from('wrong image').toString('base64'),
      'data:image/jpeg;base64,'+Buffer.concat([Buffer.from(smallJpeg,'base64'),Buffer.from('trailer')]).toString('base64')]){
    assert.equal((await post({...fixture(),image})).status,422)
  }
  assert.equal((await post({...fixture(),image:'data:image/jpeg;base64,'+Buffer.alloc(1048577).toString('base64')})).status,413)
  await assert.rejects(readdir(dataDir),{code:'ENOENT'})
})

test('new-write quota does not block already accepted retry; ignores client-supplied IP by default', async t => {
  const {post} = await harness(t,{ipLimit:1})
  const accepted=fixture()
  assert.equal((await post(accepted)).status,201)
  const limited=await post(fixture(),{'X-Real-IP':'203.0.113.45','X-Forwarded-For':'203.0.113.5'})
  assert.equal(limited.status,429)
  assert.ok(limited.headers.get('Retry-After'))
  assert.equal((await post(accepted)).status,200)
})

test('never reports success on filesystem failure',async t=>{
  const {post,dataDir}=await harness(t)
  await writeFile(dataDir,'regular file; cannot be a directory')
  const r=await post(fixture())
  assert.equal(r.status,503)
  assert.deepEqual(await r.json(),{ok:false,error:'storage_unavailable'})
})

test('public repository paths refused; local author read lists newest only as safe JSON lines',async t=>{
  const {post,dataDir}=await harness(t)
  assert.throws(()=>spaceSuggestionsDir(fileURLToPath(new URL('../public/private',import.meta.url))))
  const first=fixture(),second=fixture()
  await post(first)
  await new Promise(done=>setTimeout(done,30))
  second.message='建议列出相关数据来源。\n第二行建议。'
  const received=await (await post(second)).json()
  await mkdir(join(dataDir,'ignore'))
  await writeFile(join(dataDir,'.incomplete.tmp'),'bad')
  const lines=execFileSync(process.execPath,[fileURLToPath(new URL('./read-space-suggestions.mjs',import.meta.url)),'--limit','1'],{encoding:'utf8',env:{...process.env,SPACE_SUGGESTIONS_DIR:dataDir}}).trim().split(/\r?\n/)
  assert.equal(lines.length,1)
  assert.equal(JSON.parse(lines[0]).id,received.id)
  assert.equal(JSON.parse(lines[0]).suggestion.message,second.message)
})
