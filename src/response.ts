import type { HttpResponse } from 'uWebSockets.js'
import type { Readable } from 'node:stream'
import { sign } from 'cookie-signature'
import cookie from 'cookie'

import type App from './app.js'

import { httpStatuses, type StatusCode } from './constants/httpStatuses.js'

import type { CookieOptions, Headers } from './types.js'

export default class Response {
  #app: App
  #uWSRes: HttpResponse

  #status: StatusCode = 200
  #headers: Headers = {}

  #sent: boolean = false
  #headersSent: boolean = false

  #onEndCallbacks: Array<() => void | Promise<void>> = []

  constructor(app: App, uWSRes: HttpResponse) {
    this.#app = app
    this.#uWSRes = uWSRes

    this.#uWSRes.onAborted(() => {
      this.#sent = true
    })
  }

  append(field: string, value: string | Array<string>) {
    if (this.#headersSent) {
      throw new Error('Cannot set headers after they have been sent to the client')
    }

    const lcField = field.toLowerCase()
    const existingValue = this.#headers[lcField]

    if (existingValue) {
      if (Array.isArray(existingValue)) {
        this.#headers[lcField] = existingValue.concat(value)
      } else {
        this.#headers[lcField] = [existingValue].concat(value)
      }
    } else {
      this.#headers[lcField] = value
    }
  }

  cookie(name: string, value: string | object, options: CookieOptions = {}) {
    const cookies: string[] = []

    const encode = options.encode || encodeURIComponent

    let cookieValue = typeof value === 'object' ? `j:${JSON.stringify(value)}` : String(value)

    if (options.signed && this.#app.config.cookieSecret) {
      cookieValue = sign(cookieValue, this.#app.config.cookieSecret)
    }

    cookies.push(`${name}=${encode(cookieValue)}`)

    const cookieHeader = cookie.serialize(name, cookieValue, {
      maxAge: options.maxAge ? Math.floor(options.maxAge / 1000) : undefined,
      domain: options.domain,
      path: options.path,
      expires: options.expires,
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
    })

    if (this.#headers['set-cookie']) {
      this.append('set-cookie', cookieHeader)
    } else {
      this.#headers['set-cookie'] = cookieHeader
    }
  }

  clearCookie(name: string, options: CookieOptions = {}) {
    this.cookie(name, '', { ...options, expires: new Date(0), maxAge: 0 })
  }

  end(data?: string | Buffer) {
    if (!this.headersSent) {
      this.#writeHeaders()
      this.#headersSent = true
    }

    if (data) {
      this.#uWSRes.end(data)
    } else {
      this.#uWSRes.end()
    }

    this.#sent = true
    this.#runOnEndCallbacks()
  }

  get(field: string): string | Array<string> | undefined {
    return this.#headers[field.toLowerCase()]
  }

  get headers(): Record<string, string | Array<string>> {
    return this.#headers
  }

  get headersSent(): boolean {
    return this.#headersSent
  }

  html(body: string) {
    this.set('content-type', 'text/html')
    this.end(body)
  }

  json(body: object) {
    let jsonBody = ''

    try {
      jsonBody = JSON.stringify(body)
    } catch {
      throw new Error('Invalid JSON body')
    }

    this.set('content-type', 'application/json')
    this.end(jsonBody)
  }

  onEnd(callback: () => void | Promise<void>) {
    if (this.#sent) {
      throw new Error('Response has already been sent, cannot add more callbacks')
    }

    this.#onEndCallbacks.push(callback)
  }

  get raw(): HttpResponse {
    return this.#uWSRes
  }

  set<T extends string>(field: T, value: string | Array<string>): void
  set<T extends Record<string, string | Array<string>>>(field: T): void
  set<T extends string | Record<string, string | Array<string>>>(
    field: T,
    value?: T extends string ? string | Array<string> : never
  ): void {
    if (this.#headersSent) {
      throw new Error('Cannot set headers after they have been sent to the client')
    }

    if (typeof field === 'string') {
      this.#headers[field.toLowerCase()] = value as string | Array<string>
    } else {
      Object.entries(field).forEach(([key, value]) => {
        this.#headers[key.toLowerCase()] = value
      })
    }
  }

  get sent(): boolean {
    return this.#sent
  }

  status(code: StatusCode) {
    this.#status = code
    const status = httpStatuses[code]
    this.#uWSRes.writeStatus(`${code.toString()} ${status.message}`)
    return this
  }

  get statusCode(): StatusCode {
    return this.#status
  }

  stream(readableStream: Readable) {
    if (this.#sent) {
      throw new Error('Response has already been sent.')
    }

    if (!this.#headersSent) {
      this.status(200)
      this.set('Transfer-Encoding', 'chunked')
      this.set('Cache-Control', 'no-cache')
      this.set('Connection', 'keep-alive')
      this.#writeHeaders()
      this.#headersSent = true
    }

    readableStream.on('data', (chunk) => {
      if (chunk) {
        this.#uWSRes.write(chunk)
      }
    })

    readableStream.on('end', () => {
      this.end()
    })

    readableStream.on('error', (error) => {
      throw error
    })
  }

  text(body: string) {
    this.set('content-type', 'text/plain')
    this.end(body)
  }

  #writeHeaders() {
    for (const [field, value] of Object.entries(this.#headers)) {
      this.#uWSRes.writeHeader(field, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  #runOnEndCallbacks() {
    this.#onEndCallbacks.forEach(async (cb) => await cb())
    this.#onEndCallbacks = []
  }
}
