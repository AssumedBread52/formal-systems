import dynamic from 'next/dynamic';

export const AuthProvider = dynamic(async () => {
  const { AuthProvider } = await import('auth/auth-provider');

  return AuthProvider;
});
