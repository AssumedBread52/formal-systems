import { UserDocument } from '@/user/user-schema';
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export const SessionUser = createParamDecorator((_: unknown, context: ExecutionContext): UserDocument => {
  const request = context.switchToHttp().getRequest<Request>();
  const { user } = request;

  if (!user) {
    throw new UnauthorizedException();
  }

  return user;
});
