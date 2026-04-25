import os from 'os'
import path from 'path'
import fs from 'fs/promises'

import nock from 'nock'

import pageLoader from '../src/index.js'

test('handles 404 error', async () => {
  const url = 'https://example.com'

  nock(url)
    .get('/')
    .reply(404)

  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  )

  await expect(pageLoader(url, dir))
    .rejects
    .toThrow()
})

test('handles network error', async () => {
  const url = 'https://example.com'

  nock(url)
    .get('/')
    .replyWithError('Network error')

  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  )

  await expect(pageLoader(url, dir))
    .rejects
    .toThrow()
})

test('handles invalid directory', async () => {
  const url = 'https://example.com'

  const html = '<html></html>'

  nock(url)
    .get('/')
    .reply(200, html)

  const invalidDir = '/invalid/path/123'

  await expect(pageLoader(url, invalidDir))
    .rejects
    .toThrow()
})
