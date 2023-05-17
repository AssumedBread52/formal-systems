import { SignUpPayload, TokenPayload } from '@/auth/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useSignUpUser: () => {
    signUpUser: MutationTrigger<MutationDefinition<SignUpPayload, BaseQueryFn, 'auth', TokenPayload, 'auth'>>;
    errorMessage: string;
    isLoading: boolean;
};
