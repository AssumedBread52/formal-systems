import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { User } from '@/user/types/user';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';
import { Description } from './description/description';

export const UserSignature = async (props: UserSignatureProps): Promise<ReactElement> => {
  const { userId } = props;

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/user/${userId}`, {
    cache: 'no-store'
  });

  const user = await response.json() as User;

  const { firstName, lastName } = user;

  return (
    <AntdCardMeta title='Created By' description={<Description firstName={firstName} lastName={lastName} />} />
  );
};
