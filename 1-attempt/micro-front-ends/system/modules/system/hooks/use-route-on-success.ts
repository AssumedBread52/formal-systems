import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useRouteOnSuccess = (isSuccess: boolean): void => {
  const { back } = useRouter();

  useEffect((): void => {
    if (isSuccess) {
      back();
    }
  }, [isSuccess, back]);
};
