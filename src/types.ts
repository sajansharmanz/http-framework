import type { z, ZodSchema } from 'zod'
import type { ParsedQs } from 'qs'

import Request from './request.js'
import Response from './response.js'

export interface AppConfig {
  cookieSecret?: string
}

export interface UploadedFile {
  data: ArrayBuffer
  type?: string
  filename?: string
}

export type Method = 'any' | 'del' | 'get' | 'options' | 'patch' | 'post' | 'put'

export type Path = string
export type Params = Record<string, string | undefined>
export type Query = ParsedQs
export type RequestBody = Record<string, unknown>
export type Cookies = Record<string, string | undefined>
export type SignedCookies = Record<string, string>
export type Headers = Record<string, string | Array<string>>
export type Files = Record<string, UploadedFile | UploadedFile[] | undefined>

export interface CookieOptions {
  domain?: string
  encode?: (value: string | number | boolean) => Promise<string> | string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  secure?: boolean
  signed?: boolean
  sameSite?: false | 'lax' | 'strict' | 'none' | undefined
}

export type NextFunction = () => void | Promise<void>

export type RequestHandler<P, Q, B, C, SC> = (
  req: Request<P, Q, B, C, SC>,
  res: Response,
  next: NextFunction
) => void | Promise<void>

export type ErrorHandler<P, Q, B, C, SC> = (
  error: unknown,
  req: Request<P, Q, B, C, SC>,
  res: Response,
  next: NextFunction
) => void | Promise<void>

export interface Schema {
  params?: ZodSchema<unknown>
  query?: ZodSchema<unknown>
  requestBody?: ZodSchema<unknown>
  cookies?: ZodSchema<unknown>
  signedCookies?: ZodSchema<unknown>
}

export interface Route<P, Q, B, C, SC> {
  method: Method
  schema: Schema
  middlewares: Array<RequestHandler<P, Q, B, C, SC>>
  handler: RequestHandler<P, Q, B, C, SC>
}

type RemoveLeadingSlash<Path extends string> = Path extends `/${infer Rest}` ? Rest : Path

export type ExtractParams<Path extends string> = string extends Path
  ? Record<string, string | undefined>
  : RemoveLeadingSlash<Path> extends `${infer Segment}/${infer Rest}`
    ? Segment extends `:${infer Param}?`
      ? { [K in Param]?: string } & ExtractParams<Rest>
      : Segment extends `:${infer Param}`
        ? { [K in Param]: string } & ExtractParams<Rest>
        : ExtractParams<Rest>
    : RemoveLeadingSlash<Path> extends `:${infer Param}?`
      ? { [K in Param]?: string }
      : RemoveLeadingSlash<Path> extends `:${infer Param}`
        ? { [K in Param]: string }
        : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {}

export type InferParams<P extends Path, S extends Schema> =
  S['params'] extends ZodSchema<unknown>
    ? Omit<ExtractParams<P>, keyof z.infer<S['params']>> & z.infer<S['params']>
    : ExtractParams<P>

export type InferQuery<S extends Schema> =
  S['query'] extends ZodSchema<unknown> ? z.infer<S['query']> : Query

export type InferRequestBody<S extends Schema> =
  S['requestBody'] extends ZodSchema<unknown> ? z.infer<S['requestBody']> : RequestBody

export type InferCookies<S extends Schema> =
  S['cookies'] extends ZodSchema<unknown> ? z.infer<S['cookies']> & Cookies : Cookies

export type InferSignedCookies<S extends Schema> =
  S['signedCookies'] extends ZodSchema<unknown>
    ? z.infer<S['signedCookies']> & SignedCookies
    : SignedCookies

export type Validators = 'params' | 'query' | 'requestBody' | 'cookies' | 'signedCookies'
