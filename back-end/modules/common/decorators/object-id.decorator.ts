import { ExecutionContext, UnprocessableEntityException, createParamDecorator } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

export const ObjectIdDecorator = createParamDecorator((key: string, context: ExecutionContext): ObjectId => {
  const request = context.switchToHttp().getRequest<Request>();

  const { params } = request;

  if (!isMongoId(params[key])) {
    throw new UnprocessableEntityException(`${key} should be a mongodb id`);
  }

  return new ObjectId(params[key]);
});
