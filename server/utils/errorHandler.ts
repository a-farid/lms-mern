class ErrorHandler extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;

/* By including Error.captureStackTrace() in the constructor,
    you ensure that whenever an instance of ErrorHandler is created,
    the stack trace is captured and associated with that instance */
