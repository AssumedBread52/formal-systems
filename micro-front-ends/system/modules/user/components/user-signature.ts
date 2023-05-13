import dynamic from 'next/dynamic';

export const UserSignature = dynamic(async () => {
  const { UserSignature } = await import('user/user-signature');

  return UserSignature;
});
