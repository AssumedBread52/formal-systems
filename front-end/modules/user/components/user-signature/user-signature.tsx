import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { fetchUser } from '@/user/fetch-data/fetch-user';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';
import { Description } from './description/description';

export const UserSignature = async (props: UserSignatureProps): Promise<ReactElement> => {
  const { userId } = props;

  const { firstName, lastName } = await fetchUser(userId);

  return (
    <AntdCardMeta title='Created By' description={<Description firstName={firstName} lastName={lastName} />} />
  );
};
