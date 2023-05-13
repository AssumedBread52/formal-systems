import dynamic from 'next/dynamic';

export const SystemList = dynamic(async () => {
  const { SystemList } = await import('system/system-list');

  return SystemList;
});
