import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { signInUser } from '@/auth/end-points';

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/auth'
  }),
  endpoints: (builder) => {
    return {
      signInUser: signInUser(builder)
    };
  },
  reducerPath: 'auth'
});
