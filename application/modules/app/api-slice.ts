import { updateFormalSystem } from '@/formal-system/end-points';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api'
  }),
  endpoints: (builder) => {
    return {
      updateFormalSystem: updateFormalSystem(builder)
    };
  },
  tagTypes: ['formal-system']
});
