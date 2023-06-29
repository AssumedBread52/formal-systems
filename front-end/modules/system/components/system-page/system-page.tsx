import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { IdPayload } from '@/common/types/id-payload';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

const SystemDetails = dynamic(async (): Promise<ComponentType<IdPayload>> => {
  const { SystemDetails } = await import('./system-details/system-details');

  return SystemDetails;
});

export const SystemPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '' } = params;

  return (
    <AntdCard title={decodeURIComponent(systemTitle)}>
      <SystemDetails id={systemId} />
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
