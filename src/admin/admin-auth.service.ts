import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || admin.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, username: admin.username, isAdmin: true };
    return { access_token: this.jwtService.sign(payload) };
  }
}
