import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputContent = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Content is required.' }
  ] as Rule[];

  return (
    <AntdFormItem label='Content' name={name} rules={rules}>
      <AntdInput />
    </AntdFormItem>
  );
};
