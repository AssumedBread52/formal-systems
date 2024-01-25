import { pickClientServer } from '@/common/helpers/pick-client-server';
import { RenderMathProps } from '@/common/types/render-math-props';
import { ReactElement } from 'react';
import { DisplayClient } from './display-client/display-client';
import { DisplayServer } from './display-server/display-server';

export const RenderMath = (props: RenderMathProps): ReactElement => {
  const { content } = props;

  const Display = pickClientServer(DisplayClient, DisplayServer);

  return (
    <Display content={content} />
  );
};
