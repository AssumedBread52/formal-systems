import { SignInPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useSignInUser: () => {
    signInUser: MutationTrigger<MutationDefinition<SignInPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>>;
    errorMessage: string;
    isLoading: boolean;
};
