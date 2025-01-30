import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, expiry?: number): Promise<void> {
    if (expiry) {
      await this.redisClient.set(key, value, 'EX', expiry);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
