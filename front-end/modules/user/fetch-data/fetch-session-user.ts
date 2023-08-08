import { User } from '@/user/types/user';
import { cookies } from 'next/headers';

export const fetchSessionUser = async (): Promise<User> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/user/session-user`, {
    headers: {
      Cookie: cookies().toString()
    }
  });

  return response.json();
};
