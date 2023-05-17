import { useReadPaginatedSystems } from '@/system/hooks';
import { Card, Col, Input, Pagination, Row } from 'antd';
import { ReactElement, ReactNode, useState } from 'react';
import { ErrorResult } from './error-result/error-result';
import { ProtectedCreateButton } from './protected-create-button/protected-create-button';
import { SystemList } from './system-list/system-list';

const { Search } = Input;

export const SearchSystems = (): ReactElement => {
  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(10);
  const [keywords, setKeywords] = useState<string[]>([]);

  const { data, errorMessage, loading } = useReadPaginatedSystems({
    count,
    page,
    keywords
  });

  const changeHandler = (page: number, pageSize: number): void => {
    setPage(page);
    setCount(pageSize);
  };

  const searchHandler = (value: string): void => {
    setKeywords(value.split(' ').filter((keyword: string): boolean => {
      return 0 !== keyword.length;
    }));
  };

  const showTotal = (total: number, range: [number, number]): ReactNode => {
    const [min, max] = range;

    return `${min}-${Math.min(max, total)} of ${total} systems`;
  };

  return (
    <Card
      title='Formal Systems'
      loading={loading}
      extra={<ProtectedCreateButton />}
      style={{ marginLeft: '4rem', marginRight: '4rem' }}
    >
      {!errorMessage && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Search defaultValue={keywords.join(' ')} loading={loading} allowClear enterButton onSearch={searchHandler} />
          </Col>
          <Col span={24}>
            <Pagination current={page} pageSize={count} showSizeChanger showTitle total={data?.total} style={{ textAlign: 'center' }} showTotal={showTotal} onChange={changeHandler} />
          </Col>
          <Col span={24}>
            <SystemList systems={data?.results ?? []} />
          </Col>
          <Col span={24}>
            <Pagination current={page} pageSize={count} showSizeChanger showTitle total={data?.total} style={{ textAlign: 'center' }} showTotal={showTotal} onChange={changeHandler} />
          </Col>
        </Row>
      )}
      {errorMessage && (
        <ErrorResult />
      )}
    </Card>
  );
};
