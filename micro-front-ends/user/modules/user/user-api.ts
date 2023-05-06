import { editProfile, readSessionUser, readUserById } from '@/user/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5002/user'
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
