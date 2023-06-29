import { ErrorProps } from '@/app/types/error-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdResult } from '@/common/components/antd-result/antd-result';
import { ReactElement } from 'react';

export const SearchError = (props: ErrorProps): ReactElement => {
  const { reset } = props;

  const extra = [
    <AntdButton key='reset' htmlType='button' type='primary' onClick={reset}>
      Reset
    </AntdButton>
  ];

  return (
    <AntdResult extra={extra} status='500' subTitle='Failed to find formal systems.' title='Search Error' />
  );
};
