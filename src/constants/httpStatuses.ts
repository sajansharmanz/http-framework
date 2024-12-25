export const httpStatuses = {
  100: {
    message: 'Continue',
    description:
      'The server has received the request headers and the client should proceed to send the request body.',
  },
  101: {
    message: 'Switching Protocols',
    description:
      'The requester has asked the server to switch protocols and the server has agreed to do so.',
  },
  102: {
    message: 'Processing',
    description:
      'The server has received and is processing the request, but no response is available yet.',
  },

  200: { message: 'OK', description: 'The request has succeeded.' },
  201: {
    message: 'Created',
    description: 'The request has been fulfilled and a new resource has been created.',
  },
  202: {
    message: 'Accepted',
    description:
      'The request has been accepted for processing, but the processing has not been completed.',
  },
  203: {
    message: 'Non-Authoritative Information',
    description: 'The server is returning modified metadata.',
  },
  204: {
    message: 'No Content',
    description:
      'The server has successfully fulfilled the request and there is no additional content to send.',
  },
  205: {
    message: 'Reset Content',
    description:
      'The server has fulfilled the request and the user agent should reset the document view.',
  },
  206: {
    message: 'Partial Content',
    description:
      'The server is delivering only part of the resource due to a range header sent by the client.',
  },
  207: {
    message: 'Multi-Status',
    description: 'The response body contains multiple status codes.',
  },
  208: {
    message: 'Already Reported',
    description: 'The members of a DAV binding have already been enumerated in a previous reply.',
  },
  226: {
    message: 'IM Used',
    description:
      'The server has fulfilled the request for the resource, but the response is a result of one or more instance manipulations.',
  },

  300: {
    message: 'Multiple Choices',
    description: 'There are multiple options for the resource that the client may follow.',
  },
  301: {
    message: 'Moved Permanently',
    description: 'The resource has been permanently moved to a new location.',
  },
  302: {
    message: 'Found',
    description:
      'The resource was found at a different URI, but the client should continue to use the original URI.',
  },
  303: {
    message: 'See Other',
    description: 'The response to the request can be found under a different URI.',
  },
  304: {
    message: 'Not Modified',
    description: 'The resource has not been modified since the last request.',
  },
  305: {
    message: 'Use Proxy',
    description: 'The requested resource must be accessed through a proxy.',
  },
  306: {
    message: 'Switch Proxy',
    description:
      'No longer used. Originally meant subsequent requests should use the specified proxy.',
  },
  307: {
    message: 'Temporary Redirect',
    description: 'The resource has been temporarily moved to another URI.',
  },
  308: {
    message: 'Permanent Redirect',
    description: 'The resource has been permanently moved to another URI.',
  },

  400: {
    message: 'Bad Request',
    description: 'The server could not understand the request due to invalid syntax.',
  },
  401: {
    message: 'Unauthorized',
    description: 'The client must authenticate itself to get the requested response.',
  },
  402: { message: 'Payment Required', description: 'Reserved for future use.' },
  403: {
    message: 'Forbidden',
    description: 'The client does not have access rights to the content.',
  },
  404: {
    message: 'Not Found',
    description: 'The server cannot find the requested resource.',
  },
  405: {
    message: 'Method Not Allowed',
    description:
      'The request method is known by the server but is not supported by the target resource.',
  },
  406: {
    message: 'Not Acceptable',
    description:
      "The server cannot produce a response matching the list of acceptable values defined in the request's Accept headers.",
  },
  407: {
    message: 'Proxy Authentication Required',
    description: 'The client must authenticate itself with the proxy.',
  },
  408: {
    message: 'Request Timeout',
    description: 'The server did not receive a complete request in time.',
  },
  409: {
    message: 'Conflict',
    description: 'The request conflicts with the current state of the server.',
  },
  410: {
    message: 'Gone',
    description: 'The requested resource is no longer available and will not be available again.',
  },
  411: {
    message: 'Length Required',
    description: 'The server refuses to accept the request without a defined Content-Length.',
  },
  412: {
    message: 'Precondition Failed',
    description: 'The server does not meet one of the preconditions specified in the request.',
  },
  413: {
    message: 'Payload Too Large',
    description: 'The request entity is larger than limits defined by the server.',
  },
  414: {
    message: 'URI Too Long',
    description: 'The URI requested by the client is longer than the server is willing to process.',
  },
  415: {
    message: 'Unsupported Media Type',
    description: "The media type of the request's data is not supported by the server.",
  },
  416: {
    message: 'Range Not Satisfiable',
    description: 'The range specified by the Range header in the request cannot be fulfilled.',
  },
  417: {
    message: 'Expectation Failed',
    description: 'The expectation given in the Expect header could not be met by the server.',
  },
  418: {
    message: "I'm a teapot",
    description: "The teapot is short and stout. This is an April Fools' joke defined in RFC 2324.",
  },
  421: {
    message: 'Misdirected Request',
    description: 'The request was directed at a server that is not able to produce a response.',
  },
  422: {
    message: 'Unprocessable Entity',
    description:
      'The server understands the request, but the request is syntactically incorrect or invalid.',
  },
  423: {
    message: 'Locked',
    description: 'The resource that is being accessed is locked.',
  },
  424: {
    message: 'Failed Dependency',
    description: 'The request failed due to failure of a previous request.',
  },
  425: {
    message: 'Too Early',
    description: 'The server is unwilling to risk processing a request that might be replayed.',
  },
  426: {
    message: 'Upgrade Required',
    description: 'The client should switch to a different protocol.',
  },
  428: {
    message: 'Precondition Required',
    description: 'The origin server requires the request to be conditional.',
  },
  429: {
    message: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time.',
  },
  431: {
    message: 'Request Header Fields Too Large',
    description:
      'The server is unwilling to process the request because its header fields are too large.',
  },
  451: {
    message: 'Unavailable For Legal Reasons',
    description: 'The server is denying access to the resource as a consequence of a legal demand.',
  },

  500: {
    message: 'Internal Server Error',
    description: "The server has encountered a situation it doesn't know how to handle.",
  },
  501: {
    message: 'Not Implemented',
    description: 'The server does not support the functionality required to fulfill the request.',
  },
  502: {
    message: 'Bad Gateway',
    description:
      'The server, while acting as a gateway or proxy, received an invalid response from the upstream server.',
  },
  503: {
    message: 'Service Unavailable',
    description:
      'The server is not ready to handle the request, usually due to overloading or maintenance.',
  },
  504: {
    message: 'Gateway Timeout',
    description:
      'The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.',
  },
  505: {
    message: 'HTTP Version Not Supported',
    description:
      'The server does not support the HTTP protocol version that was used in the request.',
  },
  506: {
    message: 'Variant Also Negotiates',
    description:
      'The server has an internal configuration error: transparent content negotiation for the request results in a circular reference.',
  },
  507: {
    message: 'Insufficient Storage',
    description: 'The server is unable to store the representation needed to complete the request.',
  },
  508: {
    message: 'Loop Detected',
    description: 'The server detected an infinite loop while processing a request.',
  },
  510: {
    message: 'Not Extended',
    description: 'The server requires further extensions to fulfill the request.',
  },
  511: {
    message: 'Network Authentication Required',
    description: 'The client needs to authenticate to gain network access.',
  },
} as const

export type StatusCode = keyof typeof httpStatuses
