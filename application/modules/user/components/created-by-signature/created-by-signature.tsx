import { Typography } from '@/common/components/typography/typography';
import { useReadUserByIdQuery } from '@/user/hooks';
import { CreatedBySignatureProps } from '@/user/types';
import dynamic from 'next/dynamic';
import { Fragment, ReactElement } from 'react';

const UserSignature = dynamic(async () => {
  const { UserSignature } = await import('user/user-signature');

  return UserSignature;
});

export const CreatedBySignature = (props: CreatedBySignatureProps): ReactElement => {
  const { userId } = props;

  const { data, isError, isSuccess } = useReadUserByIdQuery(userId);

  return (
    <Fragment>
      <UserSignature label='Created by:' userId={userId} />
      <Typography as='p' mb='0' textAlign='right'>
        {isSuccess ? 'Created by': ''}
      </Typography>
      <Typography as='p' mt='0' fontStyle={isSuccess ? 'italic' : ''} color={isError ? 'red' : ''} textAlign='right'>
        {!isError && !isSuccess ? 'Loading...' : (isSuccess ? `${data.firstName} ${data.lastName}` : 'Failed to read user data.')}
      </Typography>
    </Fragment>
  );
};
