import { IdPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useDeleteSystem: () => {
    deleteSystem: MutationTrigger<MutationDefinition<string, BaseQueryFn, 'system', IdPayload, 'system'>>;
    errorMessage: string;
    isLoading: boolean;
};
