import { EditProfilePayload, IdPayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useEditProfileMutation } from './use-edit-profile-mutation';
import { useRouteOnSuccess } from './use-route-on-success';

export const useEditProfile = (): {
  editProfile: MutationTrigger<MutationDefinition<EditProfilePayload, BaseQueryFn, 'user', IdPayload, 'user'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [editProfile, { isError, isLoading, isSuccess }] = useEditProfileMutation();

  useRouteOnSuccess(isSuccess);

  return {
    editProfile,
    errorMessage: isError ? 'Failed to edit profile.' : '',
    isLoading
  };
};
