import { DependencyItemProps } from '@/app/types';
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

  const boxShadow = entered ? 'centeredHovered' : 'centeredUnhovered';

  return (
    <Flex display='flex' flexDirection='column' borderRadius='card' boxShadow={boxShadow} minHeight='4' alignItems='center' transition='headerShadow' justifyContent='space-around' m='1' cursor='pointer' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      <em>
        {packageName}
      </em>
      version: {version.substring(1)}
    </Flex>
  );
};
