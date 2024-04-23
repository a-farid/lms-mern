class ErrorHandler extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

 export default ErrorHandler;

 /* By including Error.captureStackTrace() in the constructor,
    you ensure that whenever an instance of ErrorHandler is created,
    the stack trace is captured and associated with that instance */