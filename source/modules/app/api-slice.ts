import { signInUser, signOutUser } from '@/auth/end-points';
import { createFormalSystem, readFormalSystems } from '@/formal-system/end-points';
import { editUser, signUpUser } from '@/user/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  endpoints: (builder) => {
    return {
      signInUser: signInUser(builder),
      signOutUser: signOutUser(builder),

      createFormalSystem: createFormalSystem(builder),
      readFormalSystems: readFormalSystems(builder),

      editUser: editUser(builder),
      signUpUser: signUpUser(builder)
    };
  },
  tagTypes: []
});
