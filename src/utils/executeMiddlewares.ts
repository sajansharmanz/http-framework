import type { NextFunction, RequestHandler } from '../types.js'

import Request from '../request.js'
import Response from '../response.js'

export default async function executeMiddlewares<P, Q, B, C, SC>(
  req: Request<P, Q, B, C, SC>,
  res: Response,
  middlewares: Array<RequestHandler<P, Q, B, C, SC>>
): Promise<void> {
  let currentIndex = 0

  const next: NextFunction = async () => {
    if (res.sent) {
      return
    }

    if (currentIndex >= middlewares.length) {
      return
    }

    const middleware = middlewares[currentIndex++]!
    let nextCalled = false

    await new Promise<void>((resolve, reject) => {
      const nextWrapper: NextFunction = () => {
        nextCalled = true
        resolve()
      }

      try {
        middleware(req, res, nextWrapper)
      } catch (error) {
        reject(new Error(`Error in middleware at index ${currentIndex - 1}: ${error}`))
      }
    })

    if (!nextCalled && !res.sent) {
      throw new Error(
        `Middleware at index ${currentIndex - 1} did not call next() or send a response`
      )
    }

    if (nextCalled) {
      await next()
    }
  }

  await next()
}
