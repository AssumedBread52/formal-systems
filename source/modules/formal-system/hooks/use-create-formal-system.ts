import { NewFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCreateFormalSystemMutation } from './use-create-formal-system-mutation';

export const useCreateFormalSystem = (): {
  createFormalSystem: MutationTrigger<MutationDefinition<NewFormalSystemPayload, BaseQueryFn, '', void, 'api'>>;
  errorMessage: string;
  isLoading: boolean;
} => {
  const { back } = useRouter();

  const [createFormalSystem, { isError, isLoading, isSuccess }] = useCreateFormalSystemMutation();

  useEffect((): void => {
    if (isSuccess) {
      back();
    }
  }, [isSuccess, back]);

  return {
    createFormalSystem,
    errorMessage: isError ? 'Failed to create formal system.' : '',
    isLoading
  };
};
