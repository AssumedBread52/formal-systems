'use client';

import { AntdPagination } from '@/common/components/antd-pagination/antd-pagination';
import { PaginatedSearchParams } from '@/common/types/paginated-search-params';
import { PaginatedSearchResults } from '@/common/types/paginated-search-results';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { stringify } from 'querystring';
import { ReactElement, ReactNode } from 'react';

export const InputPagination = (props: Pick<PaginatedSearchResults<any>, 'total'>): ReactElement => {
  const { total } = props;

  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') ?? '1');
  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');

  const changeHandler = (page: number, pageSize: number): void => {
    const paginatedSearchParams = { count: pageSize, page } as PaginatedSearchParams;

    if (0 < keywords.length) {
      paginatedSearchParams.keywords = keywords;
    }

    push(`${pathname}?${stringify(paginatedSearchParams)}`);
  };

  const showTotal = (total: number, range: [number, number]): ReactNode => {
    const [min, max] = range;

    return `${min} - ${max} of ${total} results`;
  };

  return (
    <AntdPagination current={page} pageSize={count} showQuickJumper showSizeChanger showTitle style={{ textAlign: 'center' }} total={total} onChange={changeHandler} showTotal={showTotal} />
  );
};
