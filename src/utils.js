import path from 'path';

const normalizeName = (url) => {
  const { hostname, pathname } = new URL(url);

  const name = `${hostname}${pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-');

  return name;
};

export const getHtmlFilename = (url) => (
  `${normalizeName(url)}.html`
);

export const getAssetsDirname = (url) => (
  `${normalizeName(url)}_files`
);

export const getAssetFilename = (url) => {
  const { hostname, pathname } = url;

  const ext = path.extname(pathname) || '.html';

  const name = `${hostname}${pathname}`
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9]/g, '-');

  return `${name}${ext}`;
};