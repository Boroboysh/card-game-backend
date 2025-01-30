import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CustomErrorException } from '../common/custom-error.exception';
import { AuthErrorCodes } from '../common/error-codes';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(username: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { username } });

    if (existingUser) {
      throw new CustomErrorException(AuthErrorCodes.USERNAME_TAKEN, 'Username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
