import dynamic from 'next/dynamic';

export const SignInForm = dynamic(async () => {
  const { SignInForm } = await import('auth/sign-in-form');

  return SignInForm;
});
