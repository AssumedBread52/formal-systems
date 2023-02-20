import { Box } from '@/common/components/box/box';
import { Typography } from '@/common/components/typography/typography';
import { ClientFormalSystem } from '@/formal-system/types';
import { useSession } from 'next-auth/react';
import { MouseEvent, ReactElement, useState } from 'react';

export const FormalSystemItem = (props: ClientFormalSystem): ReactElement => {
  const { title, description } = props;

  const { status } = useSession();

  const [entered, setEntered] = useState<boolean>(false);

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
    <Box boxShadow={shadow} borderRadius='card' cursor='pointer' my='2' px='3' py='2' position='relative' onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      {'authenticated' === status && (
        <Box position='absolute' right='3'>
          Delete
        </Box>
      )}
      <Typography as='h4'>
        {title}
      </Typography>
      <Typography as='p'>
        {description}
      </Typography>
      Created By Signature
    </Box>
  );
};
