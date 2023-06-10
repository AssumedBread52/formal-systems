import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

export const SessionUserId = createParamDecorator((_: unknown, context: ExecutionContext): ObjectId => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (!user) {
    throw new UnauthorizedException('User must be authorized.');
  }

  const { _id } = user;

  return _id;
});
