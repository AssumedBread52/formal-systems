import { refreshToken } from '@/auth/end-points/refresh-token';
import { signIn } from '@/auth/end-points/sign-in';
import { signOut } from '@/auth/end-points/sign-out';
import { signUp } from '@/auth/end-points/sign-up';
import { createSymbol } from '@/symbol/end-points/create-symbol';
import { editSymbol } from '@/symbol/end-points/edit-symbol';
import { removeSymbol } from '@/symbol/end-points/remove-symbol';
import { createSystem } from '@/system/end-points/create-system';
import { editSystem } from '@/system/end-points/edit-system';
import { removeSystem } from '@/system/end-points/remove-system';
import { editProfile } from '@/user/end-points/edit-profile';
import { BaseQueryFn, EndpointBuilder, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Tags } from './constants/tags';
import { TagTypes } from './types/tag-types';

const { location } = window;

const { origin } = location;

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${origin}/api`
  }),
  endpoints: (builder: EndpointBuilder<BaseQueryFn, TagTypes, 'api'>): {
    refreshToken: ReturnType<typeof refreshToken>;
    signIn: ReturnType<typeof signIn>;
    signOut: ReturnType<typeof signOut>;
    signUp: ReturnType<typeof signUp>;

    createSymbol: ReturnType<typeof createSymbol>;
    editSymbol: ReturnType<typeof editSymbol>;
    removeSymbol: ReturnType<typeof removeSymbol>;

    createSystem: ReturnType<typeof createSystem>;
    editSystem: ReturnType<typeof editSystem>;
    removeSystem: ReturnType<typeof removeSystem>;

    editProfile: ReturnType<typeof editProfile>;
  } => {
    return {
      refreshToken: refreshToken(builder),
      signIn: signIn(builder),
      signOut: signOut(builder),
      signUp: signUp(builder),

      createSymbol: createSymbol(builder),
      editSymbol: editSymbol(builder),
      removeSymbol: removeSymbol(builder),

      createSystem: createSystem(builder),
      editSystem: editSystem(builder),
      removeSystem: removeSystem(builder),

      editProfile: editProfile(builder)
    };
  },
  reducerPath: 'api',
  tagTypes: Object.values(Tags)
});
