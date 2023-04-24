import { useReadUserByIdQuery } from '@/user/hooks';
import { UserSignatureProps } from '@/user/types';
import { Card, Typography } from 'antd';
import { ReactElement } from 'react';

const { Meta } = Card;
const { Text } = Typography;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label = 'Test Label', userId = 'Test User ID' } = props;

  const { data, isError, isSuccess } = useReadUserByIdQuery(userId);

  let title = '';
  let description = 'Loading...';
  if (isSuccess) {
    const { firstName, lastName } = data;

    title = label;
    description = `${firstName} ${lastName}`;
  } else if (isError) {
    title = 'Error';
    description = 'Failed to pull user data.';
  }

  return (
    <Meta
      title={title}
      description={
        <Text>
          {description}
        </Text>
      }
    />
  );
};
