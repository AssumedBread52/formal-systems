'use client';

import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFlex } from '@/common/components/antd-flex/antd-flex';
import { AntdFormErrorList } from '@/common/components/antd-form-error-list/antd-form-error-list';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdFormList } from '@/common/components/antd-form-list/antd-form-list';
import { AntdMinusCircleOutlined } from '@/common/components/antd-minus-circle-outlined/antd-minus-circle-outlined';
import { AntdPlusCircleOutlined } from '@/common/components/antd-plus-circle-outlined/antd-plus-circle-outlined';
import { ExpressionBuilder } from '@/common/components/expression-builder/expression-builder';
import { InputProps } from '@/common/types/input-props';
import { FormListFieldData, FormListOperation } from 'antd';
import { RuleObject } from 'antd/es/form';
import { ValidatorRule } from 'rc-field-form/lib/interface';
import { Fragment, ReactElement, ReactNode } from 'react';

export const InputLogicalHypotheses = (props: InputProps): ReactElement => {
  const { name } = props;

  const rules = [
    {
      message: 'All logical hypotheses must be unique.',
      validator: (currentRule: RuleObject, value?: string[][]): Promise<any | void> => {
        const { message } = currentRule;

        if (!value) {
          return Promise.resolve();
        }

        const dictionary = {} as Record<string, string>;
        for (const expression of value) {
          const key = expression.join('');

          if (dictionary[key]) {
            return Promise.reject(message);
          } else {
            dictionary[key] = key;
          }
        }

        return Promise.resolve();
      }
    }
  ] as ValidatorRule[];

  return (
    <AntdFormItem label='Logical Hypotheses' name={name}>
      <AntdFormList name={name} rules={rules}>
        {(fields: FormListFieldData[], operation: FormListOperation, meta: { errors: ReactNode[]; warnings: ReactNode[]; }): ReactNode => {
          const { add, remove } = operation;
          const { errors } = meta;

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

                  const rules = [
                    { required: true, message: 'Must be a constant prefixed expression.' }
                  ];

                  return (
                    <Fragment key={key}>
                      <AntdFormItem name={name} rules={rules}>
                        <ExpressionBuilder name={name} />
                      </AntdFormItem>
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
                <AntdFormErrorList errors={errors} />
              </AntdFormItem>
            </Fragment>
          );
        }}
      </AntdFormList>
    </AntdFormItem>
  );
};
