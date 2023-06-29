import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { PaginationSearchControlsProps } from '@/common/types/pagination-search-controls-props';
import { PropsWithChildren, ReactElement } from 'react';

export const PaginationSearchControls = (props: PropsWithChildren<PaginationSearchControlsProps>): ReactElement => {
  const { children, resultType, total } = props;

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
