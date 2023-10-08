import { AsyncResponseResolverReturnType, MockedResponse, PathParams, ResponseComposition, RestContext, RestRequest, rest } from 'msw';

export const postRefreshToken = rest.post('http://localhost/api/auth/refresh-token', (restRequest: RestRequest<never, PathParams<string>>, responseComposition: ResponseComposition<{}>, restContext: RestContext): AsyncResponseResolverReturnType<MockedResponse<{}>> => {
  const { cookies } = restRequest;

  const { token } = cookies;

  switch (token) {
    case 'valid-token':
      return responseComposition(restContext.status(204), restContext.cookie('token', 'valid-token'));
  }
});
