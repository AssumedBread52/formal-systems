import { Symbol } from '@/symbol/types/symbol';

export const fetchSymbol = async (systemId: string, symbolId: string): Promise<Symbol> => {
  const response = await fetch(`http://localhost:${process.env.PORT}/api/system/${systemId}/symbol/${symbolId}`, {
    cache: 'no-store'
  });

  return response.json();
};
