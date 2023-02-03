import { DependencyItemProps } from '@/app/types';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { MouseEvent, ReactElement, useState } from 'react';

export const DependencyItem = (props: DependencyItemProps): ReactElement => {
  const { packageName, version } = props;

  const [entered, setEntered] = useState(false);

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    window.open(`https://www.npmjs.com/package/${packageName}`, '_blank');
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

  const boxShadow = entered ? '0 0 0.325rem 0 rgb(128 128 128 / 50%)' : '0 0 0 0.075rem rgb(128 128 128 / 25%)';

  return (
    <Box boxShadow={boxShadow} borderRadius='8px' cursor='pointer' p='1' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      <Flex display='flex' flexDirection='column' alignItems='center'>
        <em>
          {packageName}
        </em>
        version: {version.substring(1)}
      </Flex>
    </Box>
  );
};
