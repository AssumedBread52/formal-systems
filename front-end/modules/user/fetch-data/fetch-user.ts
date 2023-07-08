import { User } from '@/user/types/user';

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/user/${userId}`, {
    cache: 'no-store'
  });

  return response.json();
};
