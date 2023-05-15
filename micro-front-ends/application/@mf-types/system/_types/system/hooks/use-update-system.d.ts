import { IdPayload, UpdateSystemPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useUpdateSystem: () => {
    updateSystem: MutationTrigger<MutationDefinition<UpdateSystemPayload, BaseQueryFn, 'system', IdPayload, 'system'>>;
    errorMessage: string;
    isLoading: boolean;
};
