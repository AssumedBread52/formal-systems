import { AntdAvatar } from '@/common/components/antd-avatar/antd-avatar';
import { AntdBadge } from '@/common/components/antd-badge/antd-badge';
import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { AntdTypographyText } from '@/common/components/antd-typography-text/antd-typography-text';
import { AntdUserOutlined } from '@/common/components/antd-user-outlined/antd-user-outlined';
import { fetchUser } from '@/user/fetch-data/fetch-user';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';

export const UserSignature = async (props: UserSignatureProps): Promise<ReactElement> => {
  const { userId } = props;

  const { firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount } = await fetchUser(userId);

  const userAvatar = (
    <AntdBadge count={systemCount + constantSymbolCount + variableSymbolCount} title='Entities created'>
      <AntdAvatar icon={<AntdUserOutlined />} size='large' />
    </AntdBadge>
  );

  const signature = (
    <AntdTypographyText italic>
      {`${firstName} ${lastName}`}
      <br />
      {email}
    </AntdTypographyText>
  );

  return (
    <AntdCardMeta avatar={userAvatar} description={signature} title='Created By' />
  );
};
