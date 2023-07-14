import { AntdAvatar } from '@/common/components/antd-avatar/antd-avatar';
import { AntdBadge } from '@/common/components/antd-badge/antd-badge';
import { AntdUserOutlined } from '@/common/components/antd-user-outlined/antd-user-outlined';
import { User } from '@/user/types/user';
import { ReactElement } from 'react';

export const UserAvatar = (props: Omit<User, 'id' | 'firstName' | 'lastName' | 'email'>): ReactElement => {
  const { systemEntitiesCount } = props;

  return (
    <AntdBadge count={systemEntitiesCount} title='Entities created'>
      <AntdAvatar icon={<AntdUserOutlined />} size='large' />
    </AntdBadge>
  );
};
