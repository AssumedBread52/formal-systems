import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRouteBack = (goBack: boolean): void => {
  const { back } = useRouter();

  useEffect((): void => {
    if (goBack) {
      back();
    }
  }, [back, goBack]);
};
