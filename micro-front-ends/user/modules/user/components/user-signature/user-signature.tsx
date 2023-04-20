import { UserSignatureProps } from '@/user/types';
import { Card } from 'antd';
import { ReactElement } from 'react';

const { Meta } = Card;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label = 'Test Label', userId = 'Test User ID' } = props;

  return (
    <Meta title={label} description={userId} />
  );
};
