import { useReadUserById } from '@/user/hooks';
import { UserSignatureProps } from '@/user/types';
import { Card, Typography } from 'antd';
import { ReactElement } from 'react';

const { Meta } = Card;
const { Text } = Typography;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label = 'Test Label', userId = 'Test User ID' } = props;

  const { data, loading } = useReadUserById(userId);

  let title = '';
  let description = 'Loading...';
  if (data) {
    const { firstName, lastName } = data;

    title = label;
    description = `${firstName} ${lastName}`;
  } else if (!loading) {
    title = 'Error';
    description = 'Failed to load user data.';
  }

  return (
    <Meta
      title={title}
      description={
        <Text italic>
          {description}
        </Text>
      }
    />
  );
};
