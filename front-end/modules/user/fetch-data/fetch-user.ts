import { User } from '@/user/types/user';

export const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/user/${userId}`, {
    cache: 'no-store'
  });

  return response.json();
};
