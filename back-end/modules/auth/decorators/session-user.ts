import { UserEntity } from '@/user/user.entity';
import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const SessionUser = createParamDecorator((_: unknown, context: ExecutionContext): UserEntity => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (!user) {
    throw new UnauthorizedException('User must be authorized.');
  }

  return user;
});
