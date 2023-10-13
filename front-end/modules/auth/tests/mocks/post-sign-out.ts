import { AsyncResponseResolverReturnType, MockedResponse, PathParams, ResponseComposition, RestContext, RestRequest, rest } from 'msw';

export const postSignOut = rest.post('http://localhost/api/auth/sign-out', (restRequest: RestRequest<never, PathParams<string>>, responseComposition: ResponseComposition<{}>, restContext: RestContext): AsyncResponseResolverReturnType<MockedResponse<{}>> => {
  const { cookies } = restRequest;

  const { token } = cookies;

  switch (token) {
    case 'invalid-token':
      return responseComposition(restContext.status(401));
    case 'valid-token':
      return responseComposition(restContext.status(204), restContext.cookie('token', ''));
  }
});
