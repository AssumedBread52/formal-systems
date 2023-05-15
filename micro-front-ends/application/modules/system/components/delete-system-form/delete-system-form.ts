import dynamic from 'next/dynamic';

export const DeleteSystemForm = dynamic(async () => {
  const { DeleteSystemForm } = await import('system/delete-system-form');

  return DeleteSystemForm;
});
