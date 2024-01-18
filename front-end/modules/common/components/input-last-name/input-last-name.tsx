import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputLastName = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Last name is required.' }
  ] as Rule[];

  return (
    <AntdFormItem label='Last Name' name={name} rules={rules}>
      <AntdInput />
    </AntdFormItem>
  );
};
