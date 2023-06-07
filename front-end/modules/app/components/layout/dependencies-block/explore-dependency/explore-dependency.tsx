'use client';

import { ExploreDependencyProps } from '@/app/types/explore-dependency-props';
import { Card } from 'antd';
import { MouseEvent, PropsWithChildren, ReactElement } from 'react';

const { Grid } = Card;

export const ExploreDependency = (props: PropsWithChildren<ExploreDependencyProps>): ReactElement => {
  const { children, packageName } = props;

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    window.open(`https://www.npmjs.com/package/${packageName}`, '_blank');
  };

  return (
    <Grid style={{ cursor: 'pointer', textAlign: 'center', width: '20%' }} onClick={clickHandler}>
      {children}
    </Grid>
  );
};
