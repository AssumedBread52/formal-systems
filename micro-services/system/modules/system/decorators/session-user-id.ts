import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const SessionUserId = createParamDecorator((_: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (!user) {
    throw new UnauthorizedException();
  }

  const { id } = user;

  return id;
});
