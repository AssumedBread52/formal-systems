import { NewFormalSystemPayload } from '@/formal-system/types';
import { BaseQueryFn, MutationDefinition } from '@reduxjs/toolkit/dist/query';
import { MutationTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCreateFormalSystemMutation } from './use-create-formal-system-mutation';

export const useCreateFormalSystem = (): [MutationTrigger<MutationDefinition<NewFormalSystemPayload, BaseQueryFn, '', void, 'api'>>, boolean, boolean] => {
  const router = useRouter();

  const [createFormalSystem, { isError, isLoading, isSuccess }] = useCreateFormalSystemMutation();

  useEffect((): void => {
    if (isSuccess) {
      router.back();
    }
  }, [isSuccess, router]);

  return [createFormalSystem, isError, isLoading];
};
