import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { RenderMath } from '@/common/components/render-math/render-math';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';
import { EditSymbol } from './edit-symbol/edit-symbol';
import { ExploreSymbolLink } from './explore-symbol-link/explore-symbol-link';
import { RemoveSymbol } from './remove-symbol/remove-symbol';

export const SymbolItem = (props: Pick<Symbol, 'id' | 'title' | 'description' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId } = props;

  const actions = [
    <ProtectedContent userId={createdByUserId}>
      <EditSymbol id={id} newTitle={title} newDescription={description} newType={type} newContent={content} systemId={systemId} />
    </ProtectedContent>,
    <ProtectedContent userId={createdByUserId}>
      <RemoveSymbol id={id} systemId={systemId} />
    </ProtectedContent>
  ];

  return (
    <AntdCard actions={actions} extra={<ExploreSymbolLink id={id} systemId={systemId} />} title={title} type='inner'>
      {description}
      <AntdDivider />
      {type}
      <AntdDivider />
      <RenderMath content={content} />
    </AntdCard>
  );
};
