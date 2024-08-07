'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdFlex } from '@/common/components/antd-flex/antd-flex';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdFormList } from '@/common/components/antd-form-list/antd-form-list';
import { AntdInputSearch } from '@/common/components/antd-input-search/antd-input-search';
import { AntdPagination } from '@/common/components/antd-pagination/antd-pagination';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { AntdTag } from '@/common/components/antd-tag/antd-tag';
import { RenderMath } from '@/common/components/render-math/render-math';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { Symbol } from '@/symbol/types/symbol';
import { FormListFieldData, FormListOperation, InputProps } from 'antd';
import { FormListProps } from 'antd/es/form';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode, useState } from 'react';

const { useFetchSymbolQuery, useFetchSymbolsQuery } = api;

export const ConstantPrefixedExpressionBuilder = (props: Pick<FormListProps, 'name'>): ReactElement => {
  const { name } = props;

  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [types, setTypes] = useState<SymbolType[]>([SymbolType.Constant]);

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data, isLoading } = useFetchSymbolsQuery({
    page,
    count: 4,
    keywords,
    types,
    systemId
  });

  const searchHandler = (value: string): void => {
    setKeywords(value.split(' ').filter((newKeyword: string): boolean => {
      return 0 !== newKeyword.length;
    }));
  };

  return (
    <AntdFormList name={name}>
      {(fields: FormListFieldData[], operation: FormListOperation): ReactNode => {
        const { add, remove } = operation;

        return (
          <Fragment>
            <AntdRow gutter={[0, 16]}>
              <AntdCol span={24}>
                <AntdFormItem style={{ margin: 0 }}>
                  <AntdInputSearch allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
                </AntdFormItem>
              </AntdCol>
              <AntdCol span={24}>
                <AntdPagination style={{ textAlign: 'center' }} current={page} pageSize={4} onChange={setPage} total={data?.total ?? 0} />
              </AntdCol>
              <AntdCol span={24}>
                <AntdCard loading={isLoading}>
                  {(data?.results ?? []).map((symbol: Symbol): ReactElement => {
                    const { id, title, content } = symbol;

                    const addHandler = (): void => {
                      add(id);

                      if (fields.length === 0) {
                        setTypes([]);
                      }
                    };

                    return (
                      <AntdButton key={id} style={{ width: '25%' }} title={title} onClick={addHandler}>
                        <RenderMath content={content} inline />
                      </AntdButton>
                    );
                  })}
                </AntdCard>
              </AntdCol>
            </AntdRow>
            <AntdFlex wrap='wrap'>
              {fields.map((field: FormListFieldData, index: number, array: FormListFieldData[]): ReactElement => {
                const { key, name } = field;

                const ExpressionElement = (props: InputProps): ReactElement => {
                  const { value = '' } = props;

                  const { data } = useFetchSymbolQuery({
                    id: value.toString(),
                    systemId
                  });

                  const closeHandler = (): void => {
                    remove(name);

                    if (fields.length === 1) {
                      setPage(1);
                      setTypes([SymbolType.Constant]);
                    }
                  };

                  return (
                    <AntdTag closable={(index + 1) === array.length} onClose={closeHandler}>
                      <RenderMath content={data?.content ?? ''} inline />
                    </AntdTag>
                  );
                };

                return (
                  <AntdFormItem key={key} name={name}>
                    <ExpressionElement />
                  </AntdFormItem>
                );
              })}
            </AntdFlex>
          </Fragment>
        );
      }}
    </AntdFormList>
  );
};
