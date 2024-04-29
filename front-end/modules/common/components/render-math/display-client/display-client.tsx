'use client';

import { RenderMathProps } from '@/common/types/render-math-props';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CSSProperties, ReactElement, useEffect, useRef } from 'react';

export const DisplayClient = (props: RenderMathProps): ReactElement => {
  const { content, inline } = props;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    const { current } = divRef;

    if (!current) {
      return;
    }

    katex.render(content, current, {
      displayMode: !inline,
      throwOnError: false
    });
  }, [content, divRef]);

  const style = {} as CSSProperties;

  if (inline) {
    style.display = 'inline-block';
  }

  return (
    <div style={style} ref={divRef} />
  );
};
