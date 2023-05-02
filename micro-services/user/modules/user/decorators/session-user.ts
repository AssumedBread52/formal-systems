import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { UserDocument } from '@/user/user.schema';
import { Request } from 'express';

export const SessionUser = createParamDecorator((_: unknown, context: ExecutionContext): UserDocument => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (!user) {
    throw new UnauthorizedException();
  }

  return user;
});
