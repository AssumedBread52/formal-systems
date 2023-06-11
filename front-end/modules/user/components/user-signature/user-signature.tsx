'use client';

import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { AntdSkeleton } from '@/common/components/antd-skeleton/antd-skeleton';
import { AntdTypographyText } from '@/common/components/antd-typography-text/antd-typography-text';
import { useGetUserById } from '@/user/hooks/use-get-user-by-id';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { userId } = props;

  const [user, loading] = useGetUserById(userId);

  let title = 'Error';
  let description = 'Failed to load user data.';
  if (user) {
    const { firstName, lastName } = user;

    title = 'Created By';
    description = `${firstName} ${lastName}`;
  }

  return (
    <AntdSkeleton active loading={loading}>
      <AntdCardMeta title={title} description={<AntdTypographyText italic>{description}</AntdTypographyText>} />
    </AntdSkeleton>
  );
};
