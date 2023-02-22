import { IdResponse } from '@/common/types';
import { EditProfilePayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useEditUserMutation } from './use-edit-user-mutation';

export const useEditUser = (): {
  editUser: MutationTrigger<MutationDefinition<EditProfilePayload, BaseQueryFn, '', IdResponse, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const { back } = useRouter();

  const [editUser, { isError, isLoading, isSuccess }] = useEditUserMutation();

  useEffect((): void => {
    if (isSuccess) {
      back();
    }
  }, [isSuccess, back]);

  return {
    editUser,
    errorMessage: isError ? 'Failed to update profile.' : '',
    isLoading
  };
};
