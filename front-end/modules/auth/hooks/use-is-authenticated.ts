import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useIsAuthenticated = (): boolean => {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect((): void => {
    const { cookie } = document;

    setIsAuthenticated(cookie.includes('authStatus=true'));
  }, [pathname]);

  return isAuthenticated;
};
