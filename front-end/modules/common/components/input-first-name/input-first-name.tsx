import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';

export const InputFirstName = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  return (
    <AntdFormItem label='First Name' name={name} rules={[
      { required: !optional, message: 'First name is required.' },
    ]}>
      <AntdInput />
    </AntdFormItem>
  );
};
