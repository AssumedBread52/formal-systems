import { editProfile, readSessionUser, readUserById } from '@/user/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:${process.env.NEXT_PUBLIC_MICRO_SERVICE_PORT_USER}/user`,
    prepareHeaders: (headers: Headers): void => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  endpoints: (builder) => {
    return {
      editProfile: editProfile(builder),
      readSessionUser: readSessionUser(builder),
      readUserById: readUserById(builder)
    };
  },
  tagTypes: ['user'],
  reducerPath: 'user'
});
