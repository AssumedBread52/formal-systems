import { RefObject, useEffect, useRef, useState } from 'react';

export const useMainHeight = (): {
  height: number;
  headerRef: RefObject<HTMLDivElement>;
  footerRef: RefObject<HTMLDivElement>;
} => {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [footerHeight, setFooterHeight] = useState<number>(0);

  useEffect((): (() => void) => {
    const { addEventListener, removeEventListener } = window;

    const trackHeight = (): void => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.scrollHeight);
      }
      if (footerRef.current) {
        setFooterHeight(footerRef.current.scrollHeight);
      }
    };

    addEventListener('resize', trackHeight);

    trackHeight();

    return (): void => {
      removeEventListener('resize', trackHeight);
    };
  }, []);

  return {
    height: headerHeight + footerHeight,
    headerRef,
    footerRef
  };
};
