'use client';

import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { SearchControlsProps } from '@/common/types/search-controls-props';
import { PropsWithChildren, ReactElement } from 'react';

export const SearchControls = (props: PropsWithChildren<SearchControlsProps>): ReactElement => {
  const { children, total, resultType } = props;

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <InputSearch />
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType={resultType} total={total} />
      </AntdCol>
      <AntdCol span={24}>
        {children}
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType={resultType} total={total} />
      </AntdCol>
    </AntdRow>
  );
};
