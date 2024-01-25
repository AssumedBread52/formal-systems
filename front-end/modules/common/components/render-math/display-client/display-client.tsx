'use client';

import { RenderMathProps } from '@/common/types/render-math-props';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ReactElement, useEffect, useRef } from 'react';

export const DisplayClient = (props: RenderMathProps): ReactElement => {
  const { content } = props;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    const { current } = divRef;

    if (!current) {
      return;
    }

    katex.render(content, current, {
      displayMode: true,
      throwOnError: false
    });
  }, [content, divRef]);

  return (
    <div ref={divRef} />
  );
};
