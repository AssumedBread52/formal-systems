import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

export const SessionUserId = createParamDecorator((_: unknown, context: ExecutionContext): ObjectId => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  const { _id } = user!;

  return _id;
});
