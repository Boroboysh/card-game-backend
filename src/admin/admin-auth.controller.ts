import { Controller, Post, Body } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.adminAuthService.login(body.email, body.password);
  }
}
