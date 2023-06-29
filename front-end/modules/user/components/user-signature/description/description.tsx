import { AntdTypographyText } from '@/common/components/antd-typography-text/antd-typography-text';
import { User } from '@/user/types/user';
import { ReactElement } from 'react';

export const Description = (props: Omit<User, 'id' | 'email'>): ReactElement => {
  const { firstName, lastName } = props;

  return (
    <AntdTypographyText italic>
      {`${firstName} ${lastName}`}
    </AntdTypographyText>
  );
};
