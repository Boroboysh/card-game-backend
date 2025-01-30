import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { sub: string };
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    if (!req.user || !req.user.sub) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.findById(req.user.sub);
  }
}
