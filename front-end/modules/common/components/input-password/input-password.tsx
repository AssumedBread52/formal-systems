import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInputPassword } from '@/common/components/antd-input-password/antd-input-password';
import { InputProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputPassword = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Password is required.' }
  ] as Rule[];

  return (
    <AntdFormItem label='Password' name={name} rules={rules}>
      <AntdInputPassword />
    </AntdFormItem>
  );
};
