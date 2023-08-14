import { ServerSideProps } from '@/app/types/server-side-props';
import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { SymbolsDescription } from './symbols-description/symbols-description';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = await fetchSystem(systemId);

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/${title}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${id}/${title}/delete`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  ] as ReactNode[];

  return (
    <AntdCard title={title}>
      <AntdCard actions={actions}>
        {description}
        <AntdDivider />
        <UserSignature userId={createdByUserId} />
      </AntdCard>
      <AntdDivider />
      <SymbolsDescription id={id} title={title} constantSymbolCount={constantSymbolCount} variableSymbolCount={variableSymbolCount} />
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
