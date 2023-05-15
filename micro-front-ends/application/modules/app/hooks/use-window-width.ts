import { useEffect, useState } from 'react';

export const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(0);

  useEffect((): (() => void) => {
    const { addEventListener, removeEventListener } = window;

    const trackWidth = (): void => {
      const { innerWidth } = window;

      setWidth(innerWidth);
    };

    addEventListener('resize', trackWidth);

    trackWidth();

    return (): void => {
      removeEventListener('resize', trackWidth);
    };
  }, []);

  return width;
};
