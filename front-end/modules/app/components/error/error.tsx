'use client';

import { ErrorProps } from '@/app/types/error-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdResult } from '@/common/components/antd-result/antd-result';
import { ReactElement } from 'react';

export const Error = (props: ErrorProps): ReactElement => {
  const { reset } = props;

  const actions = [
    <AntdButton key='reset' htmlType='button' type='primary' onClick={reset}>
      Reset
    </AntdButton>
  ];

  return (
    <AntdResult extra={actions} status='500' subTitle='Something went wrong.' title='Error' />
  );
};
