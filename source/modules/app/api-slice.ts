import { signUpUser } from '@/user/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  endpoints: (builder) => {
    return {
      signUpUser: signUpUser(builder)
    };
  },
  tagTypes: ['session-user']
});
