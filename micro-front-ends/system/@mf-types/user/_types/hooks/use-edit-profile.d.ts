import { EditProfilePayload, IdPayload } from '@/user/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useEditProfile: () => {
    editProfile: MutationTrigger<MutationDefinition<EditProfilePayload, BaseQueryFn, 'user', IdPayload, 'user'>>;
    errorMessage: string;
    isLoading: boolean;
};
