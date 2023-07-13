import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { SystemItem } from '@/system/components/system-item/system-item';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const SystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, title, description, createdByUserId } = await fetchSystem(systemId);

  return (
    <AntdCard title='Formal System Description'>
      <SystemItem id={id} title={title} description={description} createdByUserId={createdByUserId} />
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  return {
    title: decodeURIComponent(systemTitle)
  };
};
