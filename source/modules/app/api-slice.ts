import { signInUser, signOutUser } from '@/auth/end-points';
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

      editUser: editUser(builder),
      signUpUser: signUpUser(builder)
    };
  },
  tagTypes: ['session-user']
});
