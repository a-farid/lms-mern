// Assuming this is in a file like src/types/express/index.d.ts or similar

import { Request } from "express";
import { IUser } from "../models/user.model";
import { log } from "../utils/log";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      id?: string;
    }
  }

  var log: typeof log;
}

export {};
