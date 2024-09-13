import { User } from '@/user/types/user';

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/user/${userId}`, {
    cache: 'no-store'
  });

  const { ok, statusText } = response;

  if (!ok) {
    throw new Error(statusText);
  }

  return response.json();
};
