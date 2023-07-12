import { AntdAvatar } from '@/common/components/antd-avatar/antd-avatar';
import { AntdUserOutlined } from '@/common/components/antd-user-outlined/antd-user-outlined';
import { ReactElement } from 'react';

export const UserAvatar = (): ReactElement => {
  return (
    <AntdAvatar icon={<AntdUserOutlined />} />
  );
};
