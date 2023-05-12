import { useReadUserById } from '@/user/hooks';
import { UserSignatureProps } from '@/user/types';
import { Card, Skeleton, Typography } from 'antd';
import { ReactElement } from 'react';

const { Meta } = Card;
const { Text } = Typography;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label = 'Test Label', userId = 'Test User ID' } = props;

  const { data, loading } = useReadUserById(userId);

  let title = 'Error';
  let description = 'Failed to load user data.';
  if (data) {
    const { firstName, lastName } = data;

    title = label;
    description = `${firstName} ${lastName}`;
  }

  return (
    <Skeleton loading={loading} active>
      <Meta
        title={title}
        description={
          <Text italic>
            {description}
          </Text>
        }
      />
    </Skeleton>
  );
};
