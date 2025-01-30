import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    redisInstance.on('error', (e) => {
      console.error('❌ Redis connection failed:', e);
    });

    console.log('✅ Redis connected');
    return redisInstance;
  },
};
