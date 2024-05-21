// class ErrorHandler extends Error {
//   statusCode: number;
//   constructor(message: string, statusCode: number) {
//     super(message);
//     this.statusCode = statusCode;

import { CLIENT_RENEG_LIMIT } from "tls";

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// export default ErrorHandler;

/* By including Error.captureStackTrace() in the constructor,
    you ensure that whenever an instance of ErrorHandler is created,
    the stack trace is captured and associated with that instance */

class ErrorHandler extends Error {
  statusCode: number;
  filePath: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.filePath = "unknown";

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);

    // Extract the file path from the stack trace
    const stackLines = this.stack?.split("\n");
    if (stackLines) {
      console.log("ErrorPath:", stackLines[1]);
      this.filePath = stackLines[1];
    }

    // if (stackLines && stackLines.length > 1) {
    //   const callerLine = stackLines[1];
    //   const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);
    //   // console.log(match);
    //   if (match) {
    //     this.filePath = match[1]; // Extracted file path
    //   } else {
    //     this.filePath = "unknown";
    //   }
    // } else {
    //   this.filePath = "unknown";
    // }
  }
}

export default ErrorHandler;
