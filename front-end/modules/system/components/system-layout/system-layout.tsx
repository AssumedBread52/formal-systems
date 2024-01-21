import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { SystemItem } from '@/system/components/system-item/system-item';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { PropsWithChildren, ReactElement } from 'react';

export const SystemLayout = async (props: PropsWithChildren<ServerSideProps>): Promise<ReactElement> => {
  const { params, children } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, title, description, createdByUserId } = await fetchSystem(systemId);

  return (
    <AntdCard>
      <SystemItem id={id} title={title} description={description} createdByUserId={createdByUserId} />
      <AntdDivider />
      {children}
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return {
    title
  };
};
