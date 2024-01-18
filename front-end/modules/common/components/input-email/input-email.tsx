import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputEmail = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'E-mail is required.' },
    { type: 'email', message: 'Invalid format' }
  ] as Rule[];

  return (
    <AntdFormItem label='E-mail' name={name} rules={rules}>
      <AntdInput />
    </AntdFormItem>
  );
};
