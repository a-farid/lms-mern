require("dotenv").config();
import { Redis } from "ioredis";

const redisClient = () => {
  if (process.env.REDIS_URI) {
    console.log("Redis client found", process.env.REDIS_URI);
    return process.env.REDIS_URI!;
  }
  throw new Error(`Redis client not found`);
};

export const redis = new Redis(redisClient(), {
  tls: {
    rejectUnauthorized: false,
  },
});
