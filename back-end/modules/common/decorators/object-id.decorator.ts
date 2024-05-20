import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

export const ObjectIdDecorator = createParamDecorator((key: string, context: ExecutionContext): ObjectId => {
  const request = context.switchToHttp().getRequest<Request>();

  const { params } = request;

  if (!isMongoId(params[key])) {
    throw new InvalidObjectIdException();
  }

  return new ObjectId(params[key]);
});
