'use client';

import { AntdButton } from '@/common/components/antd-button/antd-button';
import { useRouter } from 'next/navigation';
import { ReactElement } from 'react';

export const CancelButton = (): ReactElement => {
  const { back } = useRouter();

  return (
    <AntdButton htmlType='button' onClick={back}>
      Cancel
    </AntdButton>
  );
};
