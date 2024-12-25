import type { HttpRequest, HttpResponse } from 'uWebSockets.js'
import qs from 'qs'
import cookie from 'cookie'
import { unsign } from 'cookie-signature'

import type App from './app.js'

import type {
  Cookies,
  Files,
  Headers,
  Params,
  Query,
  RequestBody,
  Schema,
  SignedCookies,
  Validators,
} from './types.js'

import parseBody from './utils/parseBody.js'
import parseFiles from './utils/parseFiles.js'

export default class Request<
  P = Params,
  Q = Query,
  B = RequestBody,
  C = Cookies,
  SC = SignedCookies,
> {
  #app: App
  #uWSReq: HttpRequest
  #uWSRes: HttpResponse
  #schema: Schema

  #headers: Headers = {}

  #baseUrl: string = '/'
  #path: string = ''

  #rawBody: Buffer<ArrayBufferLike> | undefined = undefined
  #contentType: string = ''
  #body: B = {} as B
  #files: Files = {}

  #cookies: C = {} as C
  #signedCookies: SC = {} as SC

  constructor(app: App, uWSReq: HttpRequest, uWSRes: HttpResponse, schema: Schema) {
    this.#app = app
    this.#uWSReq = uWSReq
    this.#uWSRes = uWSRes
    this.#schema = schema

    this.#uWSReq.forEach((key, value) => (this.#headers[key] = value))

    this.#parseCookies()

    if (this.#app.config.cookieSecret) {
      this.#loadSignedCookies(this.#app.config.cookieSecret)
    }
  }

  get baseUrl(): string {
    return this.#baseUrl
  }

  setBaseUrl(prefix: string) {
    this.#baseUrl = prefix
  }

  async body(): Promise<B> {
    if (Object.keys(this.#body!).length !== 0) {
      return this.#body
    }

    if (!this.#contentType) {
      this.#contentType = this.get('content-type')
    }

    if (!this.#rawBody) {
      this.#rawBody = await this.#readRawBody()
    }

    this.#body = parseBody<B>(this.#rawBody, this.#contentType)

    return this.#body
  }

  get cookies(): C {
    return this.#cookies
  }

  async files(): Promise<Files> {
    if (Object.keys(this.#files).length !== 0) {
      return this.#files
    }

    if (!this.#contentType) {
      this.#contentType = this.get('content-type')
    }

    if (!this.#rawBody) {
      this.#rawBody = await this.#readRawBody()
    }

    this.#files = parseFiles(this.#rawBody, this.#contentType)

    return this.#files
  }

  get headers(): Headers {
    return this.#headers
  }

  get method(): string {
    return this.#uWSReq.getMethod().toUpperCase()
  }

  get params(): P {
    const url = new URL(this.#uWSReq.getUrl(), 'http://localhost')
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const patternSegments = this.path.split('/').filter(Boolean)
    const params: Record<string, string | undefined> = {}

    let i = 0

    for (const patternSegment of patternSegments) {
      const pathSegment = pathSegments[i]

      if (patternSegment.startsWith(':')) {
        const paramName = patternSegment.slice(1)
        let regex: RegExp | null = null

        const isOptional = paramName.endsWith('?')
        const cleanParamName = isOptional ? paramName.slice(0, -1) : paramName

        if (!pathSegment && isOptional) {
          params[cleanParamName] = undefined
          i++
          continue
        }

        const match = cleanParamName.match(/^([a-zA-Z0-9_]+)(\((.*)\))?$/)
        if (match) {
          const [, name, , pattern] = match
          regex = pattern ? new RegExp(pattern) : null

          if (regex && pathSegment && !regex.test(pathSegment)) {
            throw new Error(`Invalid value for parameter ${name}: ${pathSegment}`)
          }

          if (name) {
            params[name] = pathSegment !== undefined ? pathSegment : ''
          }
        }
      } else if (patternSegment !== pathSegment) {
        break
      }

      i++
    }

    return params as P
  }

  get path(): string {
    return this.#path
  }

  setPath(path: string) {
    this.#path = path
  }

  get query(): Q {
    const queryString = this.#uWSReq.getQuery()

    if (!queryString) {
      return {} as Q
    }

    const query = qs.parse(queryString) as Q

    return query as Q
  }

  get raw(): HttpRequest {
    return this.#uWSReq
  }

  get signedCookies(): SC {
    return this.#signedCookies
  }

  get(field: string): string {
    const lcField = field.toLowerCase()

    if (lcField === 'referer' || lcField === 'referrer') {
      // Check both "Referer" and "Referrer" as interchangeable
      return this.#uWSReq.getHeader('referer') || this.#uWSReq.getHeader('referrer')
    }

    return this.#uWSReq.getHeader(lcField)
  }

  get url(): string {
    return this.#uWSReq.getUrl()
  }

  async validate(field: Validators | Array<Validators>): Promise<void> {
    if (Array.isArray(field)) {
      field.forEach((field) => this.#validate(field))
    } else {
      this.#validate(field)
    }
  }

  async #validate(field: Validators): Promise<void> {
    const schema = this.#schema[field]
    if (schema) {
      const data = field === 'requestBody' ? await this.body() : this[field]
      schema.parse(data)
    }
  }

  #readRawBody(): Promise<Buffer> {
    let buffer: Buffer

    return new Promise((resolve) =>
      this.#uWSRes.onData((ch, isLast) => {
        const chunk = Buffer.from(ch)

        if (isLast) {
          if (buffer) {
            resolve(Buffer.concat([buffer, chunk]))
          } else {
            resolve(chunk)
          }
        } else {
          if (buffer) {
            buffer = Buffer.concat([buffer, chunk])
          } else {
            buffer = Buffer.concat([chunk])
          }
        }
      })
    )
  }

  #parseCookies() {
    const cookieHeader = this.get('cookie')

    if (cookieHeader) {
      this.#cookies = cookie.parse(cookieHeader) as C
    }
  }

  #loadSignedCookies(secret: string) {
    for (const [cookieName, cookieValue] of Object.entries<string>(this.#cookies!)) {
      if (!cookieValue) continue

      const unsignedValue = unsign(cookieValue, secret)
      if (unsignedValue !== false) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.#signedCookies[cookieName] = unsignedValue
      }
    }
  }
}
