import { ServerUser } from '@/auth/data-transfer-objects';
import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const SessionUser = createParamDecorator((_: unknown, context: ExecutionContext): ServerUser => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (!user) {
    throw new UnauthorizedException();
  }

  return user;
});
