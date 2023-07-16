import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { RenderMath } from '@/common/components/render-math/render-math';
import { Symbol } from '@/symbol/types/symbol';
import { SystemTitle } from '@/system/types/system-title';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { ComponentType, Fragment, ReactElement, ReactNode } from 'react';
import { ExploreLink } from './explore-link/explore-link';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SymbolItem = (props: Symbol & SystemTitle): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId, systemTitle } = props;

  const actions = [
  ] as ReactNode[];

  const pathname = headers().get('x-invoke-path') ?? '';

  const descriptionPath = `/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}`;

  const exploreLink = (
    <Fragment>
      {decodeURIComponent(pathname) !== descriptionPath && (
        <ExploreLink id={id} title={title} systemId={systemId} systemTitle={systemTitle} />
      )}
    </Fragment>
  );

  return (
    <AntdCard actions={actions} extra={exploreLink} title={title} type='inner'>
      {description}
      <AntdDivider />
      {type}
      <AntdDivider />
      <RenderMath content={content} />
      <AntdDivider />
      <UserSignature userId={createdByUserId} />
    </AntdCard>
  );
};
