import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new ForbiddenException('Only admins can access this route');
    }

    return true;
  }
}
