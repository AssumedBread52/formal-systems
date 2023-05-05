import { signInUser, signOutUser, signUpUser } from '@/auth/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/auth'
  }),
  endpoints: (builder) => {
    return {
      signInUser: signInUser(builder),
      signOutUser: signOutUser(builder),
      signUpUser: signUpUser(builder)
    };
  },
  reducerPath: 'auth'
});
