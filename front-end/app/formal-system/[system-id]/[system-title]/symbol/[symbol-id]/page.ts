import { ServerSideProps } from '@/app/types/server-side-props';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { redirect } from 'next/navigation';

const Page = async (props: ServerSideProps): Promise<never> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '', 'symbol-id': symbolId = '' } = params;

  const { title } = await fetchSymbol(systemId, symbolId);

  redirect(`/formal-system/${systemId}/${systemTitle}/symbol/${symbolId}/${title}`);
};

export default Page;
