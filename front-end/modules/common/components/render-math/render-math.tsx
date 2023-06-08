import { RenderMathProps } from '@/common/types/render-math-props';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ReactElement } from 'react';

export const RenderMath = (props: RenderMathProps): ReactElement => {
  const { content } = props;

  const __html = katex.renderToString(content, {
    displayMode: true,
    throwOnError: false
  });

  return (
    <div dangerouslySetInnerHTML={{ __html }} />
  );
};
