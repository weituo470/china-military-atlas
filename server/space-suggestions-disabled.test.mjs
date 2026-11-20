import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createSpaceSuggestionsMiddleware } from './space-suggestions.mjs'

test('unconfigured inbox rejects unlock and submissions at both mounts, without creating a private store', async t => {
  const dataDir = join(tmpdir(), 'earth-force-disabled-' + randomUUID())
  // Only the factory reads this setting. Isolate that synchronous call, even if
  // the developer has configured a real inbox in their own environment.
  const key = 'SPACE_SUGGESTIONS_PASSCODE'
  const previous = process.env[key]
  let receive
  try {
    delete process.env[key]
    receive = createSpaceSuggestionsMiddleware({ dataDir })
  } finally {
    if (previous !== undefined) process.env[key] = previous
  }
  const server = createServer((req, res) => receive(req, res, () => {
    res.writeHead(404)
    res.end()
  }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => {
    server.close(resolve)
    server.closeAllConnections()
  }))
  const base = 'http://127.0.0.1:' + server.address().port
  const sample = { requestId: randomUUID(), lang: 'en', chapterId: 'moon', category: 'addition',
    anchor: { kind: 'summary' }, message: 'Include a public source.' }
  for (const mount of ['/api/space-suggestions', '/china-military/api/space-suggestions']) {
    for (const [suffix, payload] of [['/unlock', { passcode: randomUUID() }], ['', sample]]) {
      const response = await fetch(base + mount + suffix, { method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(payload) })
      assert.equal(response.status, 503)
      assert.deepEqual(await response.json(), { ok: false, error: 'inbox_not_configured' })
    }
  }
  assert.equal(existsSync(dataDir), false)
})
