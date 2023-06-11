'use client';

import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { AntdSkeleton } from '@/common/components/antd-skeleton/antd-skeleton';
import { useSearchParams } from 'next/navigation';
import { ReactElement } from 'react';

export const LoadingResults = (): ReactElement => {
  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');

  return (
    <AntdRow gutter={[16, 16]}>
      {(Array.apply(null, Array(count))).map((_, index: number): ReactElement => {
        return (
          <AntdCol key={index} span={24}>
            <AntdCard loading title={<AntdSkeleton active paragraph={{ rows: 0 }} />} />
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
