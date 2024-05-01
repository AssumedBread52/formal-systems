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
import { FormListFieldData, FormListOperation, InputProps as Props } from 'antd';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode, useState } from 'react';

const { useFetchSymbolQuery, useFetchSymbolsQuery } = api;

export const ExpressionBuilder = (props: Pick<FormListFieldData, 'name'>): ReactElement => {
  const { name } = props;

  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string[]>([]);

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data, isLoading } = useFetchSymbolsQuery({
    page: page.toString(),
    count: '4',
    'keywords[]': keywords,
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
                    const { id, title, type, content } = symbol;

                    const disabled = 0 === fields.length && SymbolType.Variable === type;

                    const addHandler = (): void => {
                      if (disabled) {
                        return;
                      }

                      add(id);
                    };

                    return (
                      <AntdButton key={id} disabled={disabled} style={{ width: '25%' }} title={title} onClick={addHandler}>
                        <RenderMath content={content} inline />
                      </AntdButton>
                    );
                  })}
                </AntdCard>
              </AntdCol>
            </AntdRow>
            <AntdFlex>
              {fields.map((field: FormListFieldData, index: number, array: FormListFieldData[]): ReactElement => {
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
