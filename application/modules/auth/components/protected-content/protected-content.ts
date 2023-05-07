import dynamic from 'next/dynamic';

export const ProtectedContent = dynamic(async () => {
  const { ProtectedContent } = await import('auth/protected-content');

  return ProtectedContent;
});
