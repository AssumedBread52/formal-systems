import { ServerSideProps } from '@/app/types/server-side-props';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { redirect } from 'next/navigation';

const Page = async (props: ServerSideProps): Promise<never> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  redirect(`/formal-system/${systemId}/${title}`);
};

export default Page;
