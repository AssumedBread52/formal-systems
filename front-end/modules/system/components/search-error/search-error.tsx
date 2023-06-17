import { ErrorProps } from '@/app/types/error-props';
import { Button, Result } from 'antd';
import { ReactElement } from 'react';

export const SearchError = (props: ErrorProps): ReactElement => {
  const { reset } = props;

  const extra = [
    <Button key='reset' htmlType='button' type='primary' onClick={reset}>
      Reset
    </Button>
  ];

  return (
    <Result extra={extra} status='500' subTitle='Failed to find formal systems.' />
  );
};
