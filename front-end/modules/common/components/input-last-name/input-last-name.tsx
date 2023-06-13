import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

export const InputLastName = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  return (
    <AntdFormItem label='Last Name' name={name} rules={[
      { required: !optional, message: 'Last name is required.' }
    ]}>
      <AntdInput />
    </AntdFormItem>
  );
};
