import * as cheerio from 'cheerio'

const tags = [
  { tag: 'img', attr: 'src' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
]

export const extractResources = ($, baseUrl) => {
  const resources = []

  tags.forEach(({ tag, attr }) => {
    $(tag).each((_, element) => {
      const link = $(element).attr(attr)

      if (!link) return

      const url = new URL(link, baseUrl)

      if (url.origin !== baseUrl.origin) return

      resources.push({
        element,
        attr,
        url,
      })
    })
  })

  return resources
}
