import { refreshToken, signInUser, signOutUser, signUpUser } from '@/auth/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/auth',
    prepareHeaders: (headers: Headers): void => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  endpoints: (builder) => {
    return {
      refreshToken: refreshToken(builder),
      signInUser: signInUser(builder),
      signOutUser: signOutUser(builder),
      signUpUser: signUpUser(builder)
    };
  },
  reducerPath: 'auth'
});
