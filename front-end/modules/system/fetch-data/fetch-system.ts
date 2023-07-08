import { System } from '@/system/types/system';

export const fetchSystem = async (systemId: string): Promise<System> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system/${systemId}`, {
    cache: 'no-store'
  });

  return response.json();
};
