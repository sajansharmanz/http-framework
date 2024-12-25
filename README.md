# Web Framework on uWebSockets

This is a lightweight web framework built on top of **uWebSockets**, designed to provide high performance and flexibility for building web applications. Inspired by the simplicity of ExpressJS and the innovation of ElysiaJS, this project serves as an educational resource for understanding how such frameworks can be implemented at a high level.

## Features

### HTTP Methods

The framework supports all standard HTTP methods:

- get()
- post()
- delete()
- patch()
- any(): Handles all HTTP methods for a given endpoint.

### Middleware Support

Use the `use()` method to add middleware to your application. Middleware can optionally be scoped to a specific path.

### Router

Routers are similar to ExpressJS:

- Create and use routers for modularized routing.
- Attach routers to the app using the `attach()` method.
- Routers support all HTTP methods listed above.

### Strongly Typed Endpoints with Zod

When defining endpoints, the second parameter accepts a **Zod schema** object to:

- Define and validate `params`, `query`, `requestBody`, `cookie`, and `signedCookies`.
- Enable strong type inference for these objects in your handlers.
- Automatically validate requests, throwing a **ZodError** for invalid inputs.

### Global Error Handling

The `app.error` function allows you to define global error-handling middleware, similar to ExpressJS.

## Why This Framework?

This framework was inspired by:

- The simplicity of ExpressJS.
- The innovative approach of ElysiaJS.

It serves as a foundational example of implementing a web framework with features like strong typing and middleware support.

## Recommendation

ElysiaJS has since released a Node.js adapter, which is a more complete and advanced solution. While this repository is an excellent educational resource, consider using [ElysiaJS](https://elysiajs.com/) for production-grade applications.
