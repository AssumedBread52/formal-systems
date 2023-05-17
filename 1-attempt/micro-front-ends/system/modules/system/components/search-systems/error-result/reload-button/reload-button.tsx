import { Button } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export const ReloadButton = (): ReactElement => {
  const { reload } = useRouter();

  return (
    <Button htmlType='button' type='primary' onClick={reload}>
      Reload
    </Button>
  );
};
