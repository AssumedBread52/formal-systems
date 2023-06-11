import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { AntdTypographyText } from '@/common/components/antd-typography-text/antd-typography-text';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { userId } = props;

  return (
    <AntdCardMeta title='Created By' description={<AntdTypographyText italic>{userId}</AntdTypographyText>} />
  );
};
