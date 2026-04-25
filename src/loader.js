import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import debug from 'debug';
import { Listr } from 'listr2';

import {
  getHtmlFilename,
  getAssetsDirname,
  getAssetFilename,
} from './utils.js';

import { extractResources } from './html.js';

const log = debug('page-loader');

const loadPage = (url, outputDir = process.cwd()) => {
  log('start loading:', url);

  const parsedUrl = new URL(url);

  const htmlFilename = getHtmlFilename(url);
  const assetsDirname = getAssetsDirname(url);

  const htmlPath = path.join(outputDir, htmlFilename);
  const assetsPath = path.join(outputDir, assetsDirname);

  return axios.get(url)

    .then((response) => {
      log('html loaded');

      const $ = cheerio.load(response.data);

      const resources = extractResources($, parsedUrl);

      log(`resources found: ${resources.length}`);

      return fs.mkdir(assetsPath, { recursive: true })
        .then(() => ({ $, resources }));
    })

    .then(({ $, resources }) => {
      const promises = resources.map((resource) => {
        const assetUrl = resource.url.href;

        const filename = getAssetFilename(resource.url.pathname);

        const filepath = path.join(assetsPath, filename);

        log(`downloading: ${assetUrl}`);

        return axios.get(assetUrl, {
          responseType: 'arraybuffer',
        })
          .then((res) => fs.writeFile(filepath, res.data))
          .then(() => {
            $(resource.element).attr(
              resource.attr,
              `${assetsDirname}/${filename}`,
            );
          })
          .catch((error) => {
            log(`resource skipped: ${assetUrl}`, error.message);
          });
      });

      const tasks = new Listr([
        {
          title: 'Downloading resources',
          task: () => Promise.all(promises),
        },
      ], {
        concurrent: true,
      });

      return tasks.run()
        .then(() => $.html());
    })

    .then((html) => fs.writeFile(htmlPath, html))

    .then(() => {
      log('page saved:', htmlPath);
      return htmlPath;
    });
};

export default loadPage;
