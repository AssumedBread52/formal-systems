import { ServerSideProps } from '@/app/types/server-side-props';
import { System } from '@/system/types/system';
import { redirect } from 'next/navigation';

const Page = async (props: ServerSideProps): Promise<never> => {
  const { params } = props;

  const { 'system-id': systemId } = params;

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system/${systemId}`, {
    cache: 'no-store'
  });

  const system = await response.json() as System;

  const { id, title } = system;

  redirect(`/formal-system/${id}/${title}/delete`);
};

export default Page;
