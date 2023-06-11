'use client';

import { AntdPagination } from '@/common/components/antd-pagination/antd-pagination';
import { InputPaginationProps } from '@/common/types/input-pagination-props';
import { SearchParameters } from '@/common/types/search-parameters';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { stringify } from 'querystring';
import { ReactElement, ReactNode } from 'react';

export const InputPagination = (props: InputPaginationProps): ReactElement => {
  const { resultType, total } = props;

  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');
  const page = parseInt(searchParams.get('page') ?? '1');

  const changeHandler = (page: number, pageSize: number): void => {
    const searchParameters = { count: pageSize, page } as SearchParameters;

    if (0 < keywords.length) {
      searchParameters.keywords = keywords;
    }

    push(`${pathname}?${stringify(searchParameters)}`);
  };

  const showTotal = (total: number, range: [number, number]): ReactNode => {
    const [min, max] = range;

    return `${min} - ${max} of ${total} ${resultType}`;
  };

  return (
    <AntdPagination current={page} pageSize={count} showQuickJumper showSizeChanger showTitle style={{ textAlign: 'center' }} total={total} onChange={changeHandler} showTotal={showTotal} />
  );
};
