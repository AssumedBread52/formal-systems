import { useEffect, useState } from 'react';

export const useIsDocumentScrolled = (): boolean => {
  const [isDocumentScrolled, setIsDocumentScrolled] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const update = (): void => {
      setIsDocumentScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', update);

    return (): void => {
      window.removeEventListener('scroll', update);
    };
  }, []);

  return isDocumentScrolled;
};
