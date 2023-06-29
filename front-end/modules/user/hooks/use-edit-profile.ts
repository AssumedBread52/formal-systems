import { api } from '@/app/api';
import { TagTypes } from '@/app/types/tag-types';
import { useRouteBack } from '@/common/hooks/use-route-back';
import { IdPayload } from '@/common/types/id-payload';
import { EditProfilePayload } from '@/user/types/edit-profile-payload';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';

const { useEditProfileMutation } = api;

export const useEditProfile = (): [MutationTrigger<MutationDefinition<EditProfilePayload, BaseQueryFn, TagTypes, IdPayload, 'api'>>, boolean, boolean] => {
  const [editProfile, { isError, isLoading, isSuccess }] = useEditProfileMutation();

  useRouteBack(isSuccess);

  return [editProfile, isLoading, isError];
};
