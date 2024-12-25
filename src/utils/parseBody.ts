import { getParts } from 'uWebSockets.js'

function parseBody<B>(rawData: Buffer, contentType: string | undefined): B {
  if (!contentType || !rawData.length) {
    return {} as B
  }

  if (contentType === 'application/json') {
    return parseJSON(rawData) as B
  } else if (contentType === 'application/x-www-form-urlencoded') {
    return parseUrlEncoded(rawData) as B
  } else if (contentType.startsWith('multipart/form-data')) {
    return parseMultipart(rawData, contentType) as B
  }

  return {
    data: rawData.toString(),
    contentType,
  } as B
}

function parseJSON(rawData: Buffer): Record<string, unknown> {
  try {
    return JSON.parse(rawData.toString())
  } catch {
    throw new Error('Invalid JSON payload')
  }
}

function parseUrlEncoded(rawData: Buffer): Record<string, string> {
  const params = new URLSearchParams(rawData.toString())
  const parsed: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    parsed[key] = value
  }

  return parsed
}

function parseMultipart(rawData: Buffer, contentType: string): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  getParts(rawData, contentType)?.forEach((m) => {
    if (!m.type && !m.filename) data[m.name] = Buffer.from(m.data).toString()
  })

  return data
}

export default parseBody
