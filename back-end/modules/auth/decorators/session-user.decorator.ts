import { UserEntity } from '@/user/entities/user.entity';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';

const getRequest = (context: ExecutionContext): Request => {
  switch (context.getType()) {
    case 'http':
      const httpArgumentHost = context.switchToHttp();

      return httpArgumentHost.getRequest<Request>();
    default:
      const gqlExecutionContext = GqlExecutionContext.create(context);

      const gqlContext = gqlExecutionContext.getContext<{ req: Request; res: Response; }>();

      const { req } = gqlContext;

      return req;
  }
};

export const SessionUser = createParamDecorator((key: keyof UserEntity | undefined, context: ExecutionContext): UserEntity | UserEntity[keyof UserEntity] => {
  const request = getRequest(context);

  const { user } = request;

  if (key) {
    return user![key];
  }

  return user!;
});
