import { User } from '@/user/types/user';
import { cookies } from 'next/headers';

export const fetchSessionUser = async (): Promise<User> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/user/session-user`, {
    cache: 'no-store',
    headers: {
      cookie: cookies().toString()
    }
  });

  return response.json();
};
