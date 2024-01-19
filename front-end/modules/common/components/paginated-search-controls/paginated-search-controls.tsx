import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { PropsWithChildren, ReactElement } from 'react';

export const PaginatedSearchControls = (props: PropsWithChildren<Pick<PaginatedSearchResults<any>, 'total'>>): ReactElement => {
  const { children, total } = props;

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <InputSearch />
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination total={total} />
      </AntdCol>
      <AntdCol span={24}>
        {children}
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination total={total} />
      </AntdCol>
    </AntdRow>
  );
};
