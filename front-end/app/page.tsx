import { redirect } from 'next/navigation';

const Page = async (): Promise<never> => {
  redirect('/formal-systems');
};

export default Page;
