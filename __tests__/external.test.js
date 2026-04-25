import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import nock from 'nock'

import pageLoader from '../src/index.js'

test('ignores external resources', async () => {
  const url = 'https://example.com'

  const html = `
    <html>
      <body>
        <img src="https://cdn.com/image.png">
      </body>
    </html>
  `

  nock(url)
    .get('/')
    .reply(200, html)

  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  )

  const filepath = await pageLoader(url, dir)

  const content = await fs.readFile(filepath, 'utf-8')

  expect(content).toContain('https://cdn.com/image.png')
})
