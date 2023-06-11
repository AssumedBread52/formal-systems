import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { System } from '@/system/types/system';
import { UserSignature } from '@/user/components/user-signature/user-signature';
import Link from 'next/link';
import { ReactElement } from 'react';

export const SystemItem = (props: Omit<System, 'id'>): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  return (
    <AntdCard actions={[<ProtectedContent userId={createdByUserId}><Link href={`/formal-system/${urlPath}/edit`}><AntdEditOutlined /></Link></ProtectedContent>, <ProtectedContent userId={createdByUserId}><Link href={`/formal-system/${urlPath}/delete`}><AntdDeleteOutlined /></Link></ProtectedContent>]} extra={<Link href={`/formal-system/${urlPath}`}>Explore</Link>} title={title} type='inner'>
      {description}
      <AntdDivider />
      <UserSignature userId={createdByUserId} />
    </AntdCard>
  );
};
