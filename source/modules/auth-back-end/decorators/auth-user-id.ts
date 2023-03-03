import { NextApiRequest } from 'next';
import { createParamDecorator, UnauthorizedException } from 'next-api-decorators';
import { getToken } from 'next-auth/jwt';

export const AuthUserId = createParamDecorator<Promise<string>>(async (request: NextApiRequest): Promise<string> => {
  const token = await getToken({
    req: request
  });

  if (!token) {
    throw new UnauthorizedException('Must be authenticated.');
  }

  const { id } = token;

  return id;
});
