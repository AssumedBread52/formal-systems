import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { IdPayload } from '@/common/types/id-payload';
import { System } from '@/system/types/system';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import dynamic from 'next/dynamic';
import { ComponentType, Fragment, ReactElement } from 'react';

const UserSignature = dynamic(async (): Promise<ComponentType<UserSignatureProps>> => {
  const { UserSignature } = await import('@/user/components/user-signature/user-signature');

  return UserSignature;
});

export const SystemDetails = async (props: IdPayload): Promise<ReactElement> => {
  const { id } = props;

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system/${id}`, {
    cache: 'no-store'
  });

  const system = await response.json() as System;

  const { description, createdByUserId } = system;

  return (
    <AntdCard type='inner'>
      {system && (
        <Fragment>
          {description}
          <AntdDivider />
          <UserSignature userId={createdByUserId} />
        </Fragment>
      )}
    </AntdCard>
  );
};
