import { Flex } from '#/modules/common/components/flex/flex';
import { Grid } from '#/modules/common/components/grid/grid';
import { DependencyItemProps } from '@/app/types';
import { Box } from '@/common/components/box/box';
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

  return (
    <Box boxShadow={entered ? '0 0 0.325rem 0 rgb(128 128 128 / 50%)' : '0 0 0 0.075rem rgb(128 128 128 / 25%)'} borderRadius='8px' cursor='pointer' p='1' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
      <Grid display='grid' gridTemplateColumns='max-content' justifyContent='center'>
        <Box mx='auto'>
          <em>
            {packageName}
          </em>
        </Box>
        <Flex display='flex' justifyContent='center' width='100%'>
          <span>
            version:
          </span>
          <Box m='0.25rem' />
          <em>
            {version.substring(1)}
          </em>
        </Flex>
      </Grid>
    </Box>
  );
};
// import { Box } from '@/common/components/box/box';
// import { Flex } from '@/common/components/flex/flex';
// import { Grid } from '@/common/components/grid/grid';
// import { Space } from '@/common/components/space/space';
// import { MouseEvent, ReactElement, useState } from 'react';

// export const DependencyItem = (props: IDependencyItemProps): ReactElement => {

//   return (
//     <Box boxShadow={shadow} borderRadius='8px' cursor='pointer' p='0.5rem' onClick={clickHandler} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler}>
//       <Grid gridTemplateColumns='max-content' justifyContent='center'>
//         <Box mx='auto'>
//           <em>
//             {packageName}
//           </em>
//         </Box>
//         <Flex justifyContent='center' width='100%'>
//           <span>
//             version:
//           </span>
//           <Space m='0.25rem' />
//           <em>
//             {version.substring(1)}
//           </em>
//         </Flex>
//       </Grid>
//     </Box>
//   );
// };
