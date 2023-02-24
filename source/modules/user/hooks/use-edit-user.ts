import { TagTypes } from '@/app/types';
import { useSuccessfulRoute } from '@/common/hooks';
import { IdResponse } from '@/common/types';
import { EditProfilePayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useEditUserMutation } from './use-edit-user-mutation';

export const useEditUser = (): {
  editUser: MutationTrigger<MutationDefinition<EditProfilePayload, BaseQueryFn, TagTypes, IdResponse, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const [editUser, { isError, isLoading, isSuccess }] = useEditUserMutation();

  useSuccessfulRoute(isSuccess);

  return {
    editUser,
    errorMessage: isError ? 'Failed to update profile.' : '',
    isLoading
  };
};
