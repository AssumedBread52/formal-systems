import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { System } from '@/system/types/system';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import dynamic from 'next/dynamic';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { EditSystem } from './edit-system/edit-system';
import { ExploreSystemLink } from './explore-system-link/explore-system-link';
import { RemoveSystem } from './remove-system/remove-system';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SystemItem = (props: Pick<System, 'id' | 'title' | 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, createdByUserId } = props;

  const actions = [
    <EditSystem id={id} title={title} description={description} createdByUserId={createdByUserId} />,
    <RemoveSystem id={id} createdByUserId={createdByUserId} />
  ] as ReactNode[];

  return (
    <AntdCard actions={actions} extra={<ExploreSystemLink id={id} />} title={title} type='inner'>
      {description}
      <AntdDivider />
      <UserSignature userId={createdByUserId} />
    </AntdCard>
  );
};
