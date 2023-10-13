import { SignUpPayload } from '@/auth/types/sign-up-payload';
import { MockedResponse, PathParams, ResponseComposition, ResponseResolverReturnType, RestContext, RestRequest, rest } from 'msw';

export const postSignUp = rest.post('http://localhost/api/auth/sign-up', async (restRequest: RestRequest<never, PathParams<string>>, responseComposition: ResponseComposition<{}>, restContext: RestContext): Promise<ResponseResolverReturnType<MockedResponse<{}>>> => {
  const body = await restRequest.json() as SignUpPayload;

  const { email } = body;

  if (email.includes('invalid')) {
    return responseComposition(restContext.status(401));
  }

  return responseComposition(restContext.status(204), restContext.cookie('token', 'valid-token'));
});
