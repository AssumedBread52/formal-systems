import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { RenderMath } from '@/common/components/render-math/render-math';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { Symbol } from '@/symbol/types/symbol';
import Link from 'next/link';
import { ReactElement, ReactNode } from 'react';
import { EditSymbol } from './edit-symbol/edit-symbol';
import { RemoveSymbol } from './remove-symbol/remove-symbol';

export const SymbolItem = (props: Pick<Symbol, 'id' | 'title' | 'description' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId } = props;

  const actions = [
    <EditSymbol id={id} title={title} description={description} type={type} content={content} systemId={systemId} createdByUserId={createdByUserId} />,
    <RemoveSymbol id={id} systemId={systemId} createdByUserId={createdByUserId} />
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
