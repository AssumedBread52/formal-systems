import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdRadioGroup } from '@/common/components/antd-radio-group/antd-radio-group';
import { AntdRadio } from '@/common/components/antd-radio/antd-radio';
import { InputProps } from '@/common/types/input-props';
import { SymbolType } from '@/symbol/enums/symbol-type';
import { Rule } from 'antd/es/form';
import { ReactElement } from 'react';

export const InputSymbolType = (props: InputProps): ReactElement => {
  const { name, optional } = props;

  const rules = [
    { required: !optional, message: 'Symbol type is required.' }
  ] as Rule[];

  return (
    <AntdFormItem label='Type' name={name} rules={rules}>
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
