import { Result } from 'antd';
import { ReactElement } from 'react';
import { ReloadButton } from './reload-button/reload-button';

export const ErrorResult = (): ReactElement => {
  const extra = [
    <ReloadButton />
  ];

  return (
    <Result status='500' subTitle='Error while searching for systems.' extra={extra} />
  );
};
