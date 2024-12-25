import type App from './app.js'
import Request from './request.js'
import Response from './response.js'

import type {
  InferCookies,
  InferParams,
  InferQuery,
  InferRequestBody,
  InferSignedCookies,
  Method,
  Path,
  RequestHandler,
  Route,
  Schema,
} from './types.js'

import splitMiddlewaresAndHandler from './utils/splitMiddlewaresAndHandler.js'
import executeMiddlewares from './utils/executeMiddlewares.js'

export default class Router {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #routes: Record<string, Array<Route<any, any, any, any, any>>> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #middlewares: Record<string, Array<RequestHandler<any, any, any, any, any>>> = {}

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

  attach(app: App, prefix: string = '') {
    Object.keys(this.#routes).forEach((routeKey) => {
      const [, path] = routeKey.split(' ') as [string, string]
      const fullPath = `${prefix}${path}`

      this.#routes[routeKey]?.forEach(async ({ method, schema, middlewares, handler }) => {
        app[method](fullPath, schema, async (req: Request, res: Response) => {
          req.setBaseUrl(prefix)
          req.setPath(path)
          await req.validate(['params', 'query', 'requestBody', 'signedCookies', 'cookies'])

          const allMiddlewares = [
            ...(this.#middlewares['*'] || []),
            ...(this.#middlewares[path] || []),
            ...middlewares,
          ]

          await executeMiddlewares(req, res, allMiddlewares)

          if (!res.sent) {
            await handler(req, res, () => {})
          }
        })
      })
    })
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
    const routeKey = `${method.toLowerCase()} ${path}`

    if (!this.#routes[routeKey]) {
      this.#routes[routeKey] = []
    }

    this.#routes[routeKey].push({ method, schema, middlewares, handler })
  }
}
