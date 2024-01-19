import { refreshToken } from '@/auth/end-points/refresh-token';
import { signIn } from '@/auth/end-points/sign-in';
import { signOut } from '@/auth/end-points/sign-out';
import { signUp } from '@/auth/end-points/sign-up';
import { addSymbol } from '@/symbol/end-points/add-symbol';
import { editSymbol } from '@/symbol/end-points/edit-symbol';
import { removeSymbol } from '@/symbol/end-points/remove-symbol';
import { addSystem } from '@/system/end-points/add-system';
import { editSystem } from '@/system/end-points/edit-system';
import { removeSystem } from '@/system/end-points/remove-system';
import { editProfile } from '@/user/end-points/edit-profile';
import { BaseQueryFn, EndpointBuilder, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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

    addSymbol: ReturnType<typeof addSymbol>;
    editSymbol: ReturnType<typeof editSymbol>;
    removeSymbol: ReturnType<typeof removeSymbol>;

    addSystem: ReturnType<typeof addSystem>;
    editSystem: ReturnType<typeof editSystem>;
    removeSystem: ReturnType<typeof removeSystem>;

    editProfile: ReturnType<typeof editProfile>;
  } => {
    return {
      refreshToken: refreshToken(builder),
      signIn: signIn(builder),
      signOut: signOut(builder),
      signUp: signUp(builder),

      addSymbol: addSymbol(builder),
      editSymbol: editSymbol(builder),
      removeSymbol: removeSymbol(builder),

      addSystem: addSystem(builder),
      editSystem: editSystem(builder),
      removeSystem: removeSystem(builder),

      editProfile: editProfile(builder)
    };
  },
  reducerPath: 'api',
  tagTypes: Object.values(Tags)
});
