import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useSignOutUser: () => {
    signOutUser: MutationTrigger<MutationDefinition<void, BaseQueryFn, 'auth', void, 'auth'>>;
    errorMessage: string;
    isLoading: boolean;
};
