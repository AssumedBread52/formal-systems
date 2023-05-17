import dynamic from 'next/dynamic';

export const SignOutForm = dynamic(async () => {
  const { SignOutForm } = await import('auth/sign-out-form');

  return SignOutForm;
});
