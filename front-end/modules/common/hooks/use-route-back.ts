import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRouteBack = (goBack: boolean): void => {
  const { back, refresh } = useRouter();

  useEffect((): void => {
    if (goBack) {
      refresh();
      back();
    }
  }, [back, goBack]);
};
