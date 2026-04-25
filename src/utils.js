import path from 'path';

export const normalizeName = (url) => (
  url.replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
);

export const getHtmlFilename = (url) => (
  `${normalizeName(url)}.html`
);

export const getAssetsDirname = (url) => (
  `${normalizeName(url)}_files`
);

export const getAssetFilename = (pathname) => (
  pathname.replace(/[^a-zA-Z0-9]/g, '-')
);