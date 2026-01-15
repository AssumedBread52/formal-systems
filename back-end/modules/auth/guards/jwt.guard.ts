import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  public override getRequest(context: ExecutionContext): Request {
    switch (context.getType()) {
      case 'http':
        const httpArgumentHost = context.switchToHttp();

        return httpArgumentHost.getRequest<Request>();
      default:
        const gqlExecutionContext = GqlExecutionContext.create(context);

        const gqlContext = gqlExecutionContext.getContext<{ req: Request; res: Response }>();

        const { req } = gqlContext;

        return req;
    }
  }
};
