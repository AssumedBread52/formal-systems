import { useReadUserByIdQuery } from '@/user/hooks';
import { UserSignatureProps } from '@/user/types';
import { Card } from 'antd';
import { ReactElement } from 'react';

const { Meta } = Card;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label = 'Test Label', userId = 'Test User ID' } = props;

  const { data, isError, isSuccess } = useReadUserByIdQuery(userId);

  const title = isSuccess ? label : (isError ? 'Error' : '');
  const description = isSuccess ? `${data.firstName} ${data.lastName}` : (!isError ? 'Loading...' : '');

  return (
    <Meta title={title} description={description} />
  );
};
