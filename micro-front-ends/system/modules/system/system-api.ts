import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const systemApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:${process.env.SERVICE_PORT}/system`,
    prepareHeaders: (headers: Headers): void => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  endpoints: () => {
    return {
    };
  },
  tagTypes: ['system'],
  reducerPath: 'system'
});
