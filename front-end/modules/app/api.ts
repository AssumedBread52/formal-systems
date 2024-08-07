import { refreshToken } from '@/auth/end-points/refresh-token';
import { signIn } from '@/auth/end-points/sign-in';
import { signOut } from '@/auth/end-points/sign-out';
import { signUp } from '@/auth/end-points/sign-up';
import { addStatement } from '@/statement/end-points/add-statement';
import { editStatement } from '@/statement/end-points/edit-statement';
import { removeStatement } from '@/statement/end-points/remove-statement';
import { addSymbol } from '@/symbol/end-points/add-symbol';
import { editSymbol } from '@/symbol/end-points/edit-symbol';
import { fetchConstantSymbols } from '@/symbol/end-points/fetch-constant-symbols';
import { fetchSymbol } from '@/symbol/end-points/fetch-symbol';
import { fetchSymbols } from '@/symbol/end-points/fetch-symbols';
import { fetchVariableSymbols } from '@/symbol/end-points/fetch-variable-symbols';
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

    addStatement: ReturnType<typeof addStatement>;
    editStatement: ReturnType<typeof editStatement>;
    removeStatement: ReturnType<typeof removeStatement>;

    addSymbol: ReturnType<typeof addSymbol>;
    editSymbol: ReturnType<typeof editSymbol>;
    fetchConstantSymbols: ReturnType<typeof fetchConstantSymbols>;
    fetchSymbol: ReturnType<typeof fetchSymbol>;
    fetchSymbols: ReturnType<typeof fetchSymbols>;
    fetchVariableSymbols: ReturnType<typeof fetchVariableSymbols>;
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

      addStatement: addStatement(builder),
      editStatement: editStatement(builder),
      removeStatement: removeStatement(builder),

      addSymbol: addSymbol(builder),
      editSymbol: editSymbol(builder),
      fetchConstantSymbols: fetchConstantSymbols(builder),
      fetchSymbol: fetchSymbol(builder),
      fetchSymbols: fetchSymbols(builder),
      fetchVariableSymbols: fetchVariableSymbols(builder),
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
