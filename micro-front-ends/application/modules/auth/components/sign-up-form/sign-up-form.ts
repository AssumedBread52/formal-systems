import dynamic from 'next/dynamic';

export const SignUpForm = dynamic(async () => {
  const { SignUpForm } = await import('auth/sign-up-form');

  return SignUpForm;
});
