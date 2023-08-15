import { Symbol } from '@/symbol/types/symbol';

export const fetchSymbol = async (systemId: string, symbolId: string): Promise<Symbol> => {
  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/system/${systemId}/symbol/${symbolId}`, {
    cache: 'no-store'
  });

  return response.json();
};
