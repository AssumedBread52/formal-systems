import dynamic from 'next/dynamic';

export const SearchSystems = dynamic(async () => {
  const { SearchSystems } = await import('system/search-systems');

  return SearchSystems;
});
