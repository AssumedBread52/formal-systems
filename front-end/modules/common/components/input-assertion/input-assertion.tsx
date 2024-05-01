import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { ExpressionBuilder } from '@/common/components/expression-builder/expression-builder';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

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
