import {Redis} from 'ioredis';

const redisClient = () => {
    if(process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    throw new Error(`Redis client not found`)
    }

export const redis =  new Redis(redisClient())