import { System } from '@/system/types/system';

export const fetchSystem = async (systemId: string): Promise<System> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/system/${systemId}`, {
    cache: 'no-store'
  });

  return response.json();
};
