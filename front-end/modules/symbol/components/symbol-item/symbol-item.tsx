import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { RenderMath } from '@/common/components/render-math/render-math';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement, ReactNode } from 'react';
import { EditSymbol } from './edit-symbol/edit-symbol';
import { ExploreSymbolLink } from './explore-symbol-link/explore-symbol-link';
import { RemoveSymbol } from './remove-symbol/remove-symbol';

export const SymbolItem = (props: Pick<Symbol, 'id' | 'title' | 'description' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId } = props;

  const actions = [
    <EditSymbol id={id} title={title} description={description} type={type} content={content} systemId={systemId} createdByUserId={createdByUserId} />,
    <RemoveSymbol id={id} systemId={systemId} createdByUserId={createdByUserId} />
  ] as ReactNode[];

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
