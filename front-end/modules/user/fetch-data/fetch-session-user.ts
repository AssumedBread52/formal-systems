import { User } from '@/user/types/user';
import { cookies } from 'next/headers';

export const fetchSessionUser = async (): Promise<User> => {
  const response = await fetch(`https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/user/session-user`, {
    cache: 'no-store',
    headers: {
      Cookie: cookies().toString()
    }
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
