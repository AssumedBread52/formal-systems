import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

export const ObjectIdDecorator = createParamDecorator((key: string, context: ExecutionContext): ObjectId => {
  const request = context.switchToHttp().getRequest<Request>();

  const { params } = request;

  return new ObjectId(params[key]);
});
