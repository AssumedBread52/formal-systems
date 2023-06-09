import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInputPassword } from '@/common/components/antd-input-password/antd-input-password';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

export const InputPassword = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  return (
    <AntdFormItem label='Password' name={name} rules={[
      { required: !optional, message: 'Please enter your password.' }
    ]}>
      <AntdInputPassword />
    </AntdFormItem>
  );
};
