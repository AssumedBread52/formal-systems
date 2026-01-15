import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  public override getRequest(context: ExecutionContext): Request {
    switch (context.getType()) {
      case 'http':
        const httpArgumentHost = context.switchToHttp();

        return httpArgumentHost.getRequest<Request>();
      default:
        const gqlExecutionContext = GqlExecutionContext.create(context);

        const gqlArgs = gqlExecutionContext.getArgs<{ email: string; password: string; }>();

        const gqlContext = gqlExecutionContext.getContext<{ req: Request; res: Response }>();

        const { req } = gqlContext;

        req.body = { ...req.body, ...gqlArgs };

        return req;
    }
  }
};
