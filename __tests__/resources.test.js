import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import nock from 'nock'

import pageLoader from '../src/index.js'

const getFixturePath = name => (
  path.join('__fixtures__', name)
)

test('downloads resources and rewrites html', async () => {
  const url = 'https://example.com'

  const html = await fs.readFile(
    getFixturePath('page.html'),
    'utf-8',
  )

  const expectedHtml = await fs.readFile(
    getFixturePath('expected.html'),
    'utf-8',
  )

  const image = await fs.readFile(
    getFixturePath('image.png'),
  )

  const script = await fs.readFile(
    getFixturePath('script.js'),
  )

  const style = await fs.readFile(
    getFixturePath('style.css'),
  )

  const scope = nock(url)
    .get('/')
    .reply(200, html)
    .get('/image.png')
    .reply(200, image)
    .get('/script.js')
    .reply(200, script)
    .get('/style.css')
    .reply(200, style)

  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  )

  const filepath = await pageLoader(url, dir)

  const content = await fs.readFile(filepath, 'utf-8')

  expect(content).toBe(expectedHtml)

  expect(content).toContain('example-com_files')

  expect(scope.isDone()).toBe(true)
})
