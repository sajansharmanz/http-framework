import {
  App as uWSApp,
  type HttpRequest,
  type HttpResponse,
  type TemplatedApp,
} from 'uWebSockets.js'

import Request from './request.js'
import Response from './response.js'
import type Router from './router.js'

import type {
  AppConfig,
  ErrorHandler,
  InferCookies,
  InferParams,
  InferQuery,
  InferRequestBody,
  InferSignedCookies,
  Method,
  Path,
  RequestHandler,
  Schema,
} from './types.js'

import splitMiddlewaresAndHandler from './utils/splitMiddlewaresAndHandler.js'
import executeErrorMiddlewares from './utils/executeErrorMiddlewares.js'
import executeMiddlewares from './utils/executeMiddlewares.js'

const DEFAULT_CONFIG = Object.freeze<AppConfig>({})

export default class App {
  #uWSApp: TemplatedApp
  #config: Readonly<AppConfig> = DEFAULT_CONFIG

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #middlewares: Record<string, Array<RequestHandler<any, any, any, any, any>>> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #errorMiddlewares: Array<ErrorHandler<any, any, any, any, any>> = []

  constructor(app?: AppConfig) {
    if (app) {
      this.#config = Object.freeze<AppConfig>(app)
    }

    this.#uWSApp = uWSApp()
  }

  any<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('any', path, schema, middlewares, handler)
    return this
  }

  attach<T extends string>(prefix: T, router: Router): void
  attach<T extends Router>(router: T): void
  attach<T extends string | Router>(arg1: T, arg2?: T extends string ? Router : never) {
    if (typeof arg1 === 'string') {
      ;(arg2 as Router).attach(this, arg1)
    } else {
      arg1.attach(this)
    }
    return this
  }

  get config(): Readonly<AppConfig> {
    return this.#config
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(handler: ErrorHandler<any, any, any, any, any>) {
    this.#errorMiddlewares.push(handler)
    return this
  }

  del<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('del', path, schema, middlewares, handler)
    return this
  }

  get<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('get', path, schema, middlewares, handler)
    return this
  }

  listen(port: number, callback?: () => void | Promise<void>) {
    this.#uWSApp.listen(port, async () => {
      if (callback) {
        await callback()
      }
    })
  }

  options<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('options', path, schema, middlewares, handler)
    return this
  }

  patch<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('patch', path, schema, middlewares, handler)
    return this
  }

  post<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('post', path, schema, middlewares, handler)
    return this
  }

  put<P extends Path, S extends Schema>(
    path: P,
    schema: S,
    ...args: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >
  ) {
    const [middlewares, handler] = splitMiddlewaresAndHandler(args)
    this.#registerRoute('put', path, schema, middlewares, handler)
    return this
  }

  use<P extends Path, S extends Schema>(
    path: P,
    _schema: S,
    handler: RequestHandler<
      InferParams<P, S>,
      InferQuery<S>,
      InferRequestBody<S>,
      InferCookies<S>,
      InferSignedCookies<S>
    >
  ) {
    this.#middlewares[path] = this.#middlewares[path] || []
    this.#middlewares[path].push(handler)
    return this
  }

  #registerRoute<P extends Path, S extends Schema>(
    method: Method,
    path: P,
    schema: S,
    middlewares: Array<
      RequestHandler<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >
    >,
    handler: RequestHandler<
      InferParams<P, S>,
      InferQuery<S>,
      InferRequestBody<S>,
      InferCookies<S>,
      InferSignedCookies<S>
    >
  ) {
    this.#uWSApp[method](path, async (uWSRes: HttpResponse, uWSReq: HttpRequest) => {
      const req = new Request<
        InferParams<P, S>,
        InferQuery<S>,
        InferRequestBody<S>,
        InferCookies<S>,
        InferSignedCookies<S>
      >(this, uWSReq, uWSRes, schema)

      const res = new Response(this, uWSRes)

      req.setPath(path)
      await req.validate(['params', 'query', 'requestBody', 'signedCookies', 'cookies'])

      try {
        const allMiddlewares = [
          ...(this.#middlewares['*'] || []),
          ...(this.#middlewares[path] || []),
          ...middlewares,
        ]

        await executeMiddlewares(req, res, allMiddlewares)

        if (!res.sent) {
          await handler(req, res, () => {})
        }
      } catch (error) {
        await executeErrorMiddlewares(error, req, res, this.#errorMiddlewares)
      }
    })
  }
}
