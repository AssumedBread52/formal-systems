'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { Symbol } from '@/symbol/types/symbol';
import { Button, Card, Col, Flex, Form, FormListFieldData, FormListOperation, Input, Pagination, InputProps as Props, Row, Tag } from 'antd';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode, useState } from 'react';

const { useFetchSymbolQuery, useFetchSymbolsQuery } = api;

const { Item, List } = Form;
const { Search } = Input;

export const InputAssertion = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string[]>([]);

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data, isLoading } = useFetchSymbolsQuery({
    page: page.toString(),
    count: '4',
    'keywords[]': keywords,
    systemId
  });

  const rules = [
    { required: !optional, message: 'Assertion is required.' }
  ];

  const searchHandler = (value: string): void => {
    setKeywords(value.split(' ').filter((newKeyword: string): boolean => {
      return 0 !== newKeyword.length;
    }));
  };

  return (
    <Item label='Assertion' name={name} rules={rules}>
      <List name={name}>
        {(fields: FormListFieldData[], operation: FormListOperation): ReactNode => {
          const { add, remove } = operation;

          return (
            <Fragment>
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Search allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
                </Col>
                <Col span={24}>
                  <Pagination style={{ textAlign: 'center' }} current={page} pageSize={4} onChange={setPage} total={data?.total ?? 0} />
                </Col>
                <Col span={24}>
                  <Card loading={isLoading}>
                    {(data?.results ?? []).map((symbol: Symbol): ReactElement => {
                      const { id, title, type, content } = symbol;

                      const disabled = 0 === fields.length && SymbolType.Variable === type;

                      const addHandler = (): void => {
                        if (disabled) {
                          return;
                        }

                        add(id);
                      };

                      return (
                        <Button key={id} disabled={disabled} style={{ width: '25%' }} title={title} onClick={addHandler}>
                          <RenderMath content={content} inline />
                        </Button>
                      );
                    })}
                  </Card>
                </Col>
              </Row>
              <Flex>
                {fields.map((field: FormListFieldData): ReactElement => {
                  const { key, name } = field;

                  const ExpressionElement = (props: Props): ReactElement => {
                    const { value = '' } = props;

                    const { data } = useFetchSymbolQuery({
                      id: value.toString(),
                      systemId
                    });

                    const closeHandler = (): void => {
                      remove(name);
                    };

                    return (
                      <Tag closable onClose={closeHandler}>
                        <RenderMath content={data?.content ?? ''} inline />
                      </Tag>
                    );
                  };

                  return (
                    <Item key={key} name={name}>
                      <ExpressionElement />
                    </Item>
                  );
                })}
              </Flex>
            </Fragment>
          );
        }}
      </List>
    </Item>
  );
};
