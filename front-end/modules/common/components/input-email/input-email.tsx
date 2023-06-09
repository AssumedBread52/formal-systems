import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

export const InputEmail = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  return (
    <AntdFormItem label='E-mail' name={name} rules={[
      { required: !optional, message: 'Please enter your e-mail address.' },
      { type: 'email', message: 'Invalid format' }
    ]}>
      <AntdInput />
    </AntdFormItem>
  );
};
