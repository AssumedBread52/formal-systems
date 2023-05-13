import { NewSystemPayload } from '@/system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
export declare const useCreateSystem: () => {
    createSystem: MutationTrigger<MutationDefinition<NewSystemPayload, BaseQueryFn, 'system', void, 'system'>>;
    errorMessage: string;
    isLoading: boolean;
};
