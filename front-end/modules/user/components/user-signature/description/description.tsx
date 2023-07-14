import { AntdTypographyText } from '@/common/components/antd-typography-text/antd-typography-text';
import { User } from '@/user/types/user';
import { ReactElement } from 'react';

export const Description = (props: Omit<User, 'id' | 'systemCount' | 'symbolCount'>): ReactElement => {
  const { firstName, lastName, email } = props;

  return (
    <AntdTypographyText italic>
      {`${firstName} ${lastName}`}
      <br />
      {email}
    </AntdTypographyText>
  );
};
