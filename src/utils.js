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

export const getAssetFilename = (url) => {
  const { hostname, pathname } = url;

  const ext = path.extname(pathname);
  const name = `${hostname}${pathname}`
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9]/g, '-');

  return `${name}${ext}`;
};