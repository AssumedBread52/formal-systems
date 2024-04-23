'use client';

import { AntdPagination } from '@/common/components/antd-pagination/antd-pagination';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactElement, ReactNode } from 'react';

export const InputPagination = (props: Pick<PaginatedSearchResults<any>, 'total'>): ReactElement => {
  const { total } = props;

  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') ?? '1');
  const count = parseInt(searchParams.get('count') ?? '10');

  const changeHandler = (page: number, pageSize: number): void => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (1 !== page) {
      newSearchParams.set('page', page.toString());
    } else {
      newSearchParams.delete('page');
    }

    if (10 !== pageSize) {
      newSearchParams.set('count', pageSize.toString());
    } else {
      newSearchParams.delete('count');
    }

    push(`${pathname}?${newSearchParams.toString()}`);
  };

  const showTotal = (total: number, range: [number, number]): ReactNode => {
    const [min, max] = range;

    return `${min} - ${max} of ${total} results`;
  };

  return (
    <AntdPagination current={page} pageSize={count} showQuickJumper showSizeChanger showTitle style={{ textAlign: 'center' }} total={total} onChange={changeHandler} showTotal={showTotal} />
  );
};
