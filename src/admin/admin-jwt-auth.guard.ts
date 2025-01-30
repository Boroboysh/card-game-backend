import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded.isAdmin) throw new UnauthorizedException('Only admins can access this route');
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
