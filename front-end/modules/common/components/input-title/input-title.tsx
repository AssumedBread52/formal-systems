'use client';

import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdInput } from '@/common/components/antd-input/antd-input';
import { InputProps } from '@/common/types/input-props';
import { ChangeEvent, Fragment, ReactElement, useState } from 'react';

export const InputTitle = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const [title, setTitle] = useState<string>('');

  const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTitle(event.currentTarget.value);
  };

  return (
    <Fragment>
      <AntdFormItem label='Title' name={name} rules={[
        { required: !optional, message: 'Title is required.' }
      ]}>
        <AntdInput onChange={changeHandler} />
      </AntdFormItem>
      <AntdFormItem label='URL Path'>
        <AntdInput disabled value={encodeURIComponent(title)} />
      </AntdFormItem>
    </Fragment>
  );
};
