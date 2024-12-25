import type { RequestHandler } from '../types.js'

export default function splitMiddlewaresAndHandler<P, Q, B, C, SC>(
  args: Array<RequestHandler<P, Q, B, C, SC>>
): [Array<RequestHandler<P, Q, B, C, SC>>, RequestHandler<P, Q, B, C, SC>] {
  const middlewares: Array<RequestHandler<P, Q, B, C, SC>> = []
  let handler: RequestHandler<P, Q, B, C, SC> | undefined

  for (const arg of args) {
    if (arg.length === 2) {
      handler = arg
    } else {
      middlewares.push(arg)
    }
  }

  if (!handler) {
    throw new Error('A handler must be provided')
  }

  return [middlewares, handler]
}
