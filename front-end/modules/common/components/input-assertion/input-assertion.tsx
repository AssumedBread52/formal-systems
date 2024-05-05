import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { ConstantPrefixedExpressionBuilder } from '@/common/components/constant-prefixed-expression-builder/constant-prefixed-expression-builder';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

export const InputAssertion = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Assertion is required.' }
  ];

  return (
    <AntdFormItem label='Assertion' name={name} rules={rules}>
      <ConstantPrefixedExpressionBuilder name={name} />
    </AntdFormItem>
  );
};
