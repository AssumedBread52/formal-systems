import { ProtectedContent } from '@/auth/components';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export const ProtectedCreateButton = (): ReactElement => {
  const { push } = useRouter();

  const clickHandler = (): void => {
    push('/create-formal-system');
  };

  return (
    <ProtectedContent>
      <Button htmlType='button' type='primary' onClick={clickHandler}>
        Create
      </Button>
    </ProtectedContent>
  );
};
