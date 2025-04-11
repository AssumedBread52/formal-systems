import { UserEntity } from '@/user/entities/user.entity';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const SessionUserDecorator = createParamDecorator((key: keyof UserEntity | undefined, context: ExecutionContext): UserEntity | UserEntity[keyof UserEntity] => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  if (key) {
    return user![key];
  }

  return user!;
});
