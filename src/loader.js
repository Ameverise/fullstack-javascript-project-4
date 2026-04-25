import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'
import debug from 'debug'
import { Listr } from 'listr2'

import {
  getHtmlFilename,
  getAssetsDirname,
  getAssetFilename,
} from './utils.js'

import { extractResources } from './html.js'

const log = debug('page-loader')

const loadPage = (url, outputDir = process.cwd()) => {
  log('start loading:', url)

  const parsedUrl = new URL(url)

  const htmlFilename = getHtmlFilename(url)
  const assetsDirname = getAssetsDirname(url)

  const htmlPath = path.join(outputDir, htmlFilename)
  const assetsPath = path.join(outputDir, assetsDirname)

  return fs.access(outputDir)
    .then(() => axios.get(url))

    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      log('html loaded')

      const $ = cheerio.load(response.data)
      const resources = extractResources($, parsedUrl)

      log(`resources found: ${resources.length}`)

      return fs.mkdir(assetsPath, { recursive: true })
        .then(() => ({ $, resources }))
    })

    .then(({ $, resources }) => {
      const tasks = resources.map((resource) => {
        const assetUrl = resource.url.href
        const filename = getAssetFilename(resource.url)
        const filepath = path.join(assetsPath, filename)

        log(`downloading: ${assetUrl}`)

        const isHtml
          = resource.url.pathname.endsWith('.html')
         || resource.url.pathname === ''
       || !path.extname(resource.url.pathname)

        return axios.get(assetUrl, {
          responseType: isHtml ? 'text' : 'arraybuffer',
        })
          .then(res => fs.writeFile(filepath, res.data))
          .then(() => {
            $(resource.element).attr(
              resource.attr,
              `${assetsDirname}/${filename}`,
            )
          })
          .catch((error) => {
            log(`resource skipped: ${assetUrl}`, error.message)
          })
      })

      const listr = new Listr([
        {
          title: 'Downloading resources',
          task: () => Promise.all(tasks),
        },
      ], {
        concurrent: true,
      })

      return listr.run()
        .then(() => $.html())
    })

    .then(html => fs.writeFile(htmlPath, html))

    .then(() => {
      log('page saved:', htmlPath)
      return htmlPath
    })
}

export default loadPage
