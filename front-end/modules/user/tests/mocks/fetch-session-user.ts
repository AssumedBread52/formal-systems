import { User } from '@/user/types/user';
import { AsyncResponseResolverReturnType, MockedResponse, PathParams, ResponseComposition, RestContext, RestRequest, rest } from 'msw';

export const fetchSessionUser = rest.get(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/user/session-user`, (restRequest: RestRequest<never, PathParams<string>>, responseComposition: ResponseComposition<User>, restContext: RestContext): AsyncResponseResolverReturnType<MockedResponse<User>> => {
  const { cookies } = restRequest;

  const { token } = cookies;

  switch (token) {
    case 'invalid-token':
      return responseComposition(restContext.status(401));
    case 'valid-token':
      return responseComposition(restContext.json<User>({
        id: 'user-id',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        systemCount: 0,
        constantSymbolCount: 0,
        variableSymbolCount: 0
      }));
  }
});
