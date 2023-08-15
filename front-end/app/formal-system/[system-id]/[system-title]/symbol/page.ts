import { ServerSideProps } from '@/app/types/server-side-props';
import { redirect } from 'next/navigation';

const Page = (props: ServerSideProps): never => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '' } = params;

  redirect(`/formal-system/${systemId}/${systemTitle}/symbols`);
};

export default Page;
