import { AntdForm } from '@/common/components/antd-form/antd-form';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<NewSymbolPayload>;

export const CreateSymbolForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <TypedAntdForm labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }}>
      {children}
    </TypedAntdForm>
  );
};
