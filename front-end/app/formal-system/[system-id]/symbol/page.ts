import { ServerSideProps } from '@/app/types/server-side-props';
import { redirect } from 'next/navigation';

const Page = (props: ServerSideProps): never => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  redirect(`/formal-system/${systemId}/symbols`);
};

export default Page;
