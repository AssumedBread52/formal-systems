import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { RenderMath } from '@/common/components/render-math/render-math';
import { Symbol } from '@/symbol/types/symbol';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SymbolItem = (props: Omit<Symbol, 'id' | 'systemId'>): ReactElement => {
  const { title, description, type, content, createdByUserId } = props;

  return (
    <AntdCard title={title} type='inner'>
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
