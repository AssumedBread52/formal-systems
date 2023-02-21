import { Box } from '@/common/components/box/box';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Typography } from '@/common/components/typography/typography';
import { ClientFormalSystem } from '@/formal-system/types';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement, useState } from 'react';

export const FormalSystemItem = (props: ClientFormalSystem): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  const { status } = useSession();

  const [entered, setEntered] = useState<boolean>(false);

  const router = useRouter();

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    router.push(`/${urlPath}`);
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
    <Box title={`Explore ${title}`} boxShadow={shadow} borderRadius='card' cursor='pointer' my='2' p='3' position='relative' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      {'authenticated' === status && (
        <HyperLink title={`Delete ${title}`} position='absolute' right='3' href={`/${urlPath}/confirm-delete`}>
          Delete
        </HyperLink>
      )}
      <Typography as='h4' m='0'>
        {title}
      </Typography>
      <Typography as='p'>
        {description}
      </Typography>
      Created By Signature: {createdByUserId}
    </Box>
  );
};
