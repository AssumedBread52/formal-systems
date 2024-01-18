import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInputTextarea } from '@/common/components/antd-input-textarea/antd-input-textarea';
import { InputProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputDescription = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Description is required.' }
  ] as Rule[];

  return (
    <AntdFormItem label='Description' name={name} rules={rules}>
      <AntdInputTextarea autoSize={{ minRows: 5 }} />
    </AntdFormItem>
  );
};
