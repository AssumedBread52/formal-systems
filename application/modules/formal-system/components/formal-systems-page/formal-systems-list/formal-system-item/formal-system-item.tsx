import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Typography } from '@/common/components/typography/typography';
import { ClientFormalSystem } from '@/formal-system/types';
import { UserSignature } from '@/user/components';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Fragment, MouseEvent, ReactElement, useRef, useState } from 'react';

export const FormalSystemItem = (props: ClientFormalSystem): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  const { push } = useRouter();

  const { data, status } = useSession();

  const [entered, setEntered] = useState<boolean>(false);

  const editRef = useRef<HTMLAnchorElement>(null);
  const deleteRef = useRef<HTMLAnchorElement>(null);

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    if (editRef.current !== event.target && deleteRef.current !== event.target) {
      push(`/${urlPath}`);
    }
  };

  const mouseEnterHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setEntered(true);
  };

  const mouseLeaveHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setEntered(false);
  };

  const shadow = entered ? 'mainHovered' : 'mainUnhovered';

  return (
    <Box title={`Explore ${title}`} boxShadow={shadow} borderRadius='card' cursor='pointer' my='2' p='3' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      <Flex display='flex'>
        <Typography as='h4' m='0'>
          {title}
        </Typography>
        <Box mx='auto' />
        {'authenticated' === status && createdByUserId === data.id && (
          <Fragment>
            <HyperLink ref={editRef} title={`Edit ${title}`} href={`/${urlPath}/edit`}>
              Edit
            </HyperLink>
            <Box mx='1' />
            <HyperLink ref={deleteRef} title={`Delete ${title}`} href={`/${urlPath}/delete`}>
              Delete
            </HyperLink>
          </Fragment>
        )}
      </Flex>
      <Typography as='p'>
        {description}
      </Typography>
      <UserSignature label='Created by' userId={createdByUserId} />
    </Box>
  );
};
