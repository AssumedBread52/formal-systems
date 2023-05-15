import dynamic from 'next/dynamic';

export const UserProvider = dynamic(async () => {
  const { UserProvider } = await import('user/user-provider');

  return UserProvider;
});
