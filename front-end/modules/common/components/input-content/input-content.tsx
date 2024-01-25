import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps as InputFieldProps } from '@/common/types/input-props';
import { Rule } from 'antd/es/form';
import { Fragment, ReactElement } from 'react';
import { DisplayContent } from './display-content/display-content';

export const InputContent = (props: InputFieldProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Content is required.' }
  ] as Rule[];

  return (
    <Fragment>
      <AntdFormItem label='Content' name={name} rules={rules}>
        <AntdInput />
      </AntdFormItem>
      <AntdFormItem name={name}>
        <DisplayContent />
      </AntdFormItem>
    </Fragment>
  );
};
