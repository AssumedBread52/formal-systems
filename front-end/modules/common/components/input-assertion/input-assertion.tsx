import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';
import { ExpressionBuilder } from '../expression-builder/expression-builder';

export const InputAssertion = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Assertion is required.' }
  ];

  return (
    <AntdFormItem label='Assertion' name={name} rules={rules}>
      <ExpressionBuilder name={name} />
    </AntdFormItem>
  );
};
