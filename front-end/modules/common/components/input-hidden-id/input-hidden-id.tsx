import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { ReactElement } from 'react';

export const InputHiddenId = (): ReactElement => {
  return (
    <AntdFormItem hidden name='id'>
      <AntdInput />
    </AntdFormItem>
  );
};
