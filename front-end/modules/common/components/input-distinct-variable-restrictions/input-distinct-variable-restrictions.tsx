'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFlex } from '@/common/components/antd-flex/antd-flex';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdFormList } from '@/common/components/antd-form-list/antd-form-list';
import { AntdMinusCircleOutlined } from '@/common/components/antd-minus-circle-outlined/antd-minus-circle-outlined';
import { AntdPlusCircleOutlined } from '@/common/components/antd-plus-circle-outlined/antd-plus-circle-outlined';
import { AntdSelect } from '@/common/components/antd-select/antd-select';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { Symbol } from '@/symbol/types/symbol';
import { FormListFieldData, FormListOperation } from 'antd';
import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode } from 'react';

const { useFetchVariableSymbolsQuery } = api;

export const InputDistinctVariableRestrictions = (props: InputProps): ReactElement => {
  const { name } = props;

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data } = useFetchVariableSymbolsQuery(systemId);

  const options = data?.map((symbol: Symbol): DefaultOptionType => {
    const { id, title, content } = symbol;

    return {
      label: (
        <AntdFlex justify='space-between'>
          {title}
          <AntdSpace>
            <span />
            <span />
          </AntdSpace>
          <RenderMath content={content} inline />
        </AntdFlex>
      ),
      value: id
    };
  });

  return (
    <AntdFormItem label={<Fragment>Distinct Variable<br />Restrictions</Fragment>} name={name}>
      <AntdFormList name={name}>
        {(fields: FormListFieldData[], operation: FormListOperation): ReactNode => {
          const { add, remove } = operation;

          const addHandler = (): void => {
            add([]);
          };

          return (
            <Fragment>
              <AntdFlex vertical>
                {fields.map((field: FormListFieldData): ReactElement => {
                  const { key, name } = field;

                  const rules = [
                    { len: 2, message: 'A variable pair is required.', type: 'array' }
                  ] as Rule[];

                  const removeHandler = (): void => {
                    remove(name);
                  };

                  return (
                    <Fragment key={key}>
                      <AntdFormItem name={name} rules={rules}>
                        <AntdSelect maxCount={2} mode='multiple' options={options} />
                      </AntdFormItem>
                      <AntdFormItem>
                        <AntdButton block icon={<AntdMinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                          Remove Distinct Variable Restriction
                        </AntdButton>
                      </AntdFormItem>
                    </Fragment>
                  );
                })}
              </AntdFlex>
              <AntdFormItem>
                <AntdButton block icon={<AntdPlusCircleOutlined />} type='dashed' onClick={addHandler}>
                  Add Distinct Variable Restriction
                </AntdButton>
              </AntdFormItem>
            </Fragment>
          );
        }}
      </AntdFormList>
    </AntdFormItem>
  );
};
