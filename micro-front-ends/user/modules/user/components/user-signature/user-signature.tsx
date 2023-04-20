import { UserSignatureProps } from '@/user/types';
import { Typography } from 'antd';
import { ReactElement } from 'react';

const { Text } = Typography;

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { label } = props;

  return (
    <Text>
      {label}
    </Text>
  );
};
