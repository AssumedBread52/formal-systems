import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { System } from '@/system/types/system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { SystemDetails } from './system-details/system-details';

export const SystemPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;
  const { 'system-id': id } = params;

  return (
    <AntdCard title={id}>
      <SystemDetails />
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': id } = params;

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system/${id}`);

  const system = await response.json() as System;

  const { title } = system;

  return {
    title: `${title}`
  };
};
