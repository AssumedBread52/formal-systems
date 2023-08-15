import { ServerSideProps } from '@/app/types/server-side-props';
import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { RenderMath } from '@/common/components/render-math/render-math';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { SymbolMetrics } from './symbol-metrics/symbol-metrics';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SymbolPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'system-title': systemTitle = '', 'symbol-id': symbolId = '' } = params;

  const { id, title, description, type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, createdByUserId } = await fetchSymbol(systemId, symbolId);

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}/delete`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  ] as ReactNode[];

  return (
    <AntdCard title={title}>
      <AntdCard actions={actions}>
        {description}
        <AntdDivider />
        {SymbolType[type]}
        <AntdDivider />
        <RenderMath content={content} />
        <AntdDivider />
        <UserSignature userId={createdByUserId} />
      </AntdCard>
      <AntdDivider />
      <SymbolMetrics axiomaticStatementAppearances={axiomaticStatementAppearances} nonAxiomaticStatementAppearances={nonAxiomaticStatementAppearances} />
    </AntdCard>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;

  const { 'symbol-title': symbolTitle = '' } = params;

  return {
    title: decodeURIComponent(symbolTitle)
  };
};
