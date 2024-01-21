import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { System } from '@/system/types/system';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { ExploreSystemLink } from './explore-system/explore-system';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SystemItem = (props: Pick<System, 'id' | 'title' | 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, createdByUserId } = props;

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/remove`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  ] as ReactNode[];

  return (
    <AntdCard actions={actions} extra={<ExploreSystemLink id={id} />} title={title} type='inner'>
      {description}
      <AntdDivider />
      <UserSignature userId={createdByUserId} />
    </AntdCard>
  );
};