import { AntdCard } from '@/common/components/antd-card/antd-card';
import { System } from '@/system/types/system';
import { ReactElement } from 'react';

export const SystemItem = (props: Omit<System, 'id'>): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  return (
    <AntdCard title={title}>
      {description}
    </AntdCard>
  );
};
