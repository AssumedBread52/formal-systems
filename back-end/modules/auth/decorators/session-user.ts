import { UserEntity } from '@/user/user.entity';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const SessionUser = createParamDecorator((_: unknown, context: ExecutionContext): UserEntity => {
  const request = context.switchToHttp().getRequest<Request>();

  const { user } = request;

  return user!;
});
