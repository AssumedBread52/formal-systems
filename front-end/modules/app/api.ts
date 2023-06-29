import { getSessionUserId } from '@/auth/end-points/get-session-user-id';
import { refreshToken } from '@/auth/end-points/refresh-token';
import { signIn } from '@/auth/end-points/sign-in';
import { signOut } from '@/auth/end-points/sign-out';
import { signUp } from '@/auth/end-points/sign-up';
import { createSystem } from '@/system/end-points/create-system';
import { deleteSystem } from '@/system/end-points/delete-system';
import { editSystem } from '@/system/end-points/edit-system';
import { editProfile } from '@/user/end-points/edit-profile';
import { getSessionUser } from '@/user/end-points/get-session-user';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { Tags } from './constants/tags';
import { TagTypes } from './types/tag-types';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `http://${process.env.NEXT_PUBLIC_BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}`,
    prepareHeaders: (headers: Headers): void => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  endpoints: (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): {
    getSessionUserId: ReturnType<typeof getSessionUserId>;
    refreshToken: ReturnType<typeof refreshToken>;
    signIn: ReturnType<typeof signIn>;
    signOut: ReturnType<typeof signOut>;
    signUp: ReturnType<typeof signUp>;

    createSystem: ReturnType<typeof createSystem>;
    deleteSystem: ReturnType<typeof deleteSystem>;
    editSystem: ReturnType<typeof editSystem>;

    editProfile: ReturnType<typeof editProfile>;
    getSessionUser: ReturnType<typeof getSessionUser>;
  } => {
    return {
      getSessionUserId: getSessionUserId(builder),
      refreshToken: refreshToken(builder),
      signIn: signIn(builder),
      signOut: signOut(builder),
      signUp: signUp(builder),

      createSystem: createSystem(builder),
      deleteSystem: deleteSystem(builder),
      editSystem: editSystem(builder),

      editProfile: editProfile(builder),
      getSessionUser: getSessionUser(builder)
    };
  },
  reducerPath: 'api',
  tagTypes: Object.values(Tags)
});
