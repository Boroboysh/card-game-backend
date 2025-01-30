import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

@Injectable()
export class RedisService {
  constructor(@Inject(RedisRepository) private readonly redisRepository: RedisRepository) {}

  async saveSession(userId: string, sessionData: string, expiry = 3600): Promise<void> {
    await this.redisRepository.set(`session:${userId}`, sessionData, expiry);
  }

  async getSession(userId: string): Promise<string | null> {
    return await this.redisRepository.get(`session:${userId}`);
  }

  async deleteSession(userId: string): Promise<void> {
    await this.redisRepository.delete(`session:${userId}`);
  }
}
