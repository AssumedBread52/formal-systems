import { IdPayload } from '@/common/types/id-payload';
import { AsyncResponseResolverReturnType, MockedResponse, PathParams, ResponseComposition, RestContext, RestRequest, rest } from 'msw';

export const patchSessionUser = rest.patch('http://localhost/api/user/session-user', (restRequest: RestRequest<never, PathParams<string>>, responseComposition: ResponseComposition<IdPayload>, restContext: RestContext): AsyncResponseResolverReturnType<MockedResponse<IdPayload>> => {
  const { cookies } = restRequest;

  const { token } = cookies;

  switch (token) {
    case 'invalid-token':
      return responseComposition(restContext.status(401));
    case 'valid-token':
      return responseComposition(restContext.json<IdPayload>({
        id: 'user-id'
      }));
  }
});
