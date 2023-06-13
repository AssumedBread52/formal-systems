import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { SystemDetails } from './system-details/system-details';

export const SystemPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;
  const { 'system-url-path': urlPath } = params;

  return (
    <AntdCard title={decodeURIComponent(urlPath ?? '')}>
      <SystemDetails />
    </AntdCard>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;
  const { 'system-url-path': urlPath } = params;

  return {
    title: decodeURIComponent(urlPath ?? '')
  };
};
