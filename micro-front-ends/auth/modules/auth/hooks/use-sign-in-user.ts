import { useRouteOnSuccess } from './use-route-on-success';
import { useSignInUserMutation } from './use-sign-in-user-mutation';

export const useSignInUser = () => {
  const [signInUser, { isError, isLoading, isSuccess }] = useSignInUserMutation();

  useRouteOnSuccess(isSuccess);

  return {
    signInUser,
    errorMessage: isError ? 'Failed to sign in.' : '',
    isLoading
  };
};
