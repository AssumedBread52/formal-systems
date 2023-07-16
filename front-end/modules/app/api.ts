import { refreshToken } from '@/auth/end-points/refresh-token';
import { signIn } from '@/auth/end-points/sign-in';
import { signOut } from '@/auth/end-points/sign-out';
import { signUp } from '@/auth/end-points/sign-up';
import { createSymbol } from '@/symbol/end-points/create-symbol';
import { createSystem } from '@/system/end-points/create-system';
import { deleteSystem } from '@/system/end-points/delete-system';
import { editSystem } from '@/system/end-points/edit-system';
import { editProfile } from '@/user/end-points/edit-profile';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { Tags } from './constants/tags';
import { TagTypes } from './types/tag-types';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  endpoints: (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): {
    refreshToken: ReturnType<typeof refreshToken>;
    signIn: ReturnType<typeof signIn>;
    signOut: ReturnType<typeof signOut>;
    signUp: ReturnType<typeof signUp>;

    createSymbol: ReturnType<typeof createSymbol>;

    createSystem: ReturnType<typeof createSystem>;
    deleteSystem: ReturnType<typeof deleteSystem>;
    editSystem: ReturnType<typeof editSystem>;

    editProfile: ReturnType<typeof editProfile>;
  } => {
    return {
      refreshToken: refreshToken(builder),
      signIn: signIn(builder),
      signOut: signOut(builder),
      signUp: signUp(builder),

      createSymbol: createSymbol(builder),

      createSystem: createSystem(builder),
      deleteSystem: deleteSystem(builder),
      editSystem: editSystem(builder),

      editProfile: editProfile(builder)
    };
  },
  reducerPath: 'api',
  tagTypes: Object.values(Tags)
});
