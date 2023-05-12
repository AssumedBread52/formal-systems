import { createSystem } from '@/system/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const systemApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:${process.env.NEXT_PUBLIC_MICRO_SERVICE_PORT_SYSTEM}/system`,
    prepareHeaders: (headers: Headers): void => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
  }),
  endpoints: (builder) => {
    return {
      createSystem: createSystem(builder)
    };
  },
  tagTypes: ['system'],
  reducerPath: 'system'
});
