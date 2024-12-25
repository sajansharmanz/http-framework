import { getParts } from 'uWebSockets.js'

import type { Files } from '../types.js'

export function parseFiles(rawData: Buffer, contentType: string | undefined): Files {
  if (!contentType || !contentType.startsWith('multipart/form-data') || !rawData.length) {
    return {}
  }

  const data: Files = {}

  getParts(rawData, contentType)?.forEach((m) => {
    if (m.type && m.filename) {
      const name = m.name.slice(-2) === '[]' ? m.name.slice(0, -2) : m.name

      const value = { data: m.data, filename: m.filename, type: m.type }

      if (data[name] === undefined) {
        data[name] = m.name.slice(-2) === '[]' ? [value] : value
      } else if (Array.isArray(data[name])) {
        data[name].push(value)
      } else {
        data[name] = [data[name], value]
      }
    }
  })

  return data
}

export default parseFiles
