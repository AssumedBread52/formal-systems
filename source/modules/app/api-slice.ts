import { signInUser, signOutUser } from '@/auth/end-points';
import { createFormalSystem, deleteFormalSystem, readFormalSystems, updateFormalSystem } from '@/formal-system/end-points';
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

      createFormalSystem: createFormalSystem(builder),
      deleteFormalSystem: deleteFormalSystem(builder),
      readFormalSystems: readFormalSystems(builder),
      updateFormalSystem: updateFormalSystem(builder),

      editUser: editUser(builder),
      signUpUser: signUpUser(builder)
    };
  },
  tagTypes: ['formal-system']
});
