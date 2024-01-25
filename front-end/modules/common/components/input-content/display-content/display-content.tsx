import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from 'antd';
import { ReactElement } from 'react';

export const DisplayContent = (props: InputProps): ReactElement => {
  const { value } = props;

  return (
    <RenderMath content={value?.toString() ?? ''} />
  );
};
