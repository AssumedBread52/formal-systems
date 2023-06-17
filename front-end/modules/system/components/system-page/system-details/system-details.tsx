'use client';

import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDivider } from '@/common/components/antd-divider/antd-divider';
import { useGetSystemById } from '@/system/hooks/use-get-system-by-id';
import { UserSignature } from '@/user/components/user-signature/user-signature';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement } from 'react';

export const SystemDetails = (): ReactElement => {
  const params = useParams();
  const { 'system-id': id } = params;

  const [system, loading] = useGetSystemById(id);

  const { description, createdByUserId } = system ?? { description: '', createdByUserId: '' };

  return (
    <AntdCard loading={loading} type='inner'>
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
