import { useEffect, useState } from 'react';

export const useIsDocumentScrolled = (): boolean => {
  const [isDocumentScrolled, setIsDocumentScrolled] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const { addEventListener, removeEventListener } = window;

    const update = (): void => {
      const { scrollY } = window;

      setIsDocumentScrolled(scrollY > 0);
    };

    addEventListener('scroll', update);

    return (): void => {
      removeEventListener('scroll', update);
    };
  }, []);

  return isDocumentScrolled;
};
