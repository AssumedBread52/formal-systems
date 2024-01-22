import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { RenderMath } from '@/common/components/render-math/render-math';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { Symbol } from '@/symbol/types/symbol';
import Link from 'next/link';
import { ReactElement, ReactNode } from 'react';

export const SymbolItem = (props: Pick<Symbol, 'id' | 'title' | 'description' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId } = props;

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/symbol/${id}/edit`}>
        <AntdEditOutlined />
      </Link>
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <Link href={`/formal-system/${systemId}/symbol/${id}/remove`}>
        <AntdDeleteOutlined />
      </Link>
    </ProtectedContent>
  ] as ReactNode[];

  const exploreSymbolLink = (
    <Link href={`/formal-system/${systemId}/symbol/${id}`}>
      Explore
    </Link>
  );

  return (
    <AntdCard actions={actions} extra={exploreSymbolLink} title={title} type='inner'>
      {description}
      <AntdDivider />
      {SymbolType[type]}
      <AntdDivider />
      <RenderMath content={content} />
    </AntdCard>
  );
};
