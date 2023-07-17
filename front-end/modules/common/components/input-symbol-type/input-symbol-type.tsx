import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdRadioGroup } from '@/common/components/antd-radio-group/antd-radio-group';
import { InputProps } from '@/common/types/input-props';
import { ReactElement } from 'react';
import { AntdRadio } from '../antd-radio/antd-radio';
import { SymbolType } from '@/symbol/enums/symbol-type';

export const InputSymbolType = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  return (
    <AntdFormItem label='Type' name={name} rules={[
      { required: !optional, message: 'Symbol type is required.' }
    ]}>
      <AntdRadioGroup>
        <AntdRadio value={SymbolType.Constant}>
          Constant
        </AntdRadio>
        <AntdRadio value={SymbolType.Variable}>
          Variable
        </AntdRadio>
      </AntdRadioGroup>
    </AntdFormItem>
  );
};