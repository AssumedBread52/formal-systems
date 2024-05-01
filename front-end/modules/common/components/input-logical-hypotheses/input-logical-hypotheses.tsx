'use client';

import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFlex } from '@/common/components/antd-flex/antd-flex';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdFormList } from '@/common/components/antd-form-list/antd-form-list';
import { AntdMinusCircleOutlined } from '@/common/components/antd-minus-circle-outlined/antd-minus-circle-outlined';
import { AntdPlusCircleOutlined } from '@/common/components/antd-plus-circle-outlined/antd-plus-circle-outlined';
import { InputProps } from '@/common/types/input-props';
import { FormListFieldData, FormListOperation } from 'antd';
import { Fragment, ReactElement, ReactNode } from 'react';

export const InputLogicalHypotheses = (props: InputProps): ReactElement => {
  const { name } = props;

  return (
    <AntdFormItem label='Logical Hypotheses' name={name}>
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

                  const removeHandler = (): void => {
                    remove(name);
                  }

                  return (
                    <Fragment key={key}>
                      {name}
                      <AntdFormItem>
                        <AntdButton block icon={<AntdMinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                          Remove Logical Hypothesis
                        </AntdButton>
                      </AntdFormItem>
                    </Fragment>
                  );
                })}
              </AntdFlex>
              <AntdFormItem>
                <AntdButton block icon={<AntdPlusCircleOutlined />} type='dashed' onClick={addHandler}>
                  Add Logical Hypothesis
                </AntdButton>
              </AntdFormItem>
            </Fragment>
          );
        }}
      </AntdFormList>
    </AntdFormItem>
  );
};
