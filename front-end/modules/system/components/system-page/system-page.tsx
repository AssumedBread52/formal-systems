import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '' } = params;

  const { description, createdByUserId } = await fetchSystem(systemId);

  return (
    <AntdCard title={decodeURIComponent(systemTitle)}>
      <AntdCard type='inner'>
        {description}
        <AntdDivider />
        <UserSignature userId={createdByUserId} />
      </AntdCard>
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
