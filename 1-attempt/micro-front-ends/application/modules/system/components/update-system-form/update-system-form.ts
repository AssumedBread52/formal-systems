import dynamic from 'next/dynamic';

export const UpdateSystemForm = dynamic(async () => {
  const { UpdateSystemForm } = await import('system/update-system-form');

  return UpdateSystemForm;
});
