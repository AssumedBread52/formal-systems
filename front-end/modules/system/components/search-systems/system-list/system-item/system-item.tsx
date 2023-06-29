import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { System } from '@/system/types/system';
import { UserSignature } from '@/user/components/user-signature/user-signature';
import { ReactElement, ReactNode } from 'react';
import { DeleteLink } from './delete-link/delete-link';
import { EditLink } from './edit-link/edit-link';
import { ExploreLink } from './explore-link/explore-link';

export const SystemItem = (props: System): ReactElement => {
  const { id, title, description, createdByUserId } = props;

  const actions = [
    <EditLink id={id} title={title} createdByUserId={createdByUserId} />,
    <DeleteLink id={id} title={title} createdByUserId={createdByUserId} />
  ] as ReactNode[];

  return (
    <AntdCard actions={actions} extra={<ExploreLink id={id} title={title} />} title={title} type='inner'>
      {description}
      <AntdDivider />
      <UserSignature userId={createdByUserId} />
    </AntdCard>
  );
};
