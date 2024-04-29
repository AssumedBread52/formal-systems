import { RenderMathProps } from '@/common/types/render-math-props';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CSSProperties, ReactElement } from 'react';

export const DisplayServer = (props: RenderMathProps): ReactElement => {
  const { content, inline } = props;

  const __html = katex.renderToString(content, {
    displayMode: !inline,
    throwOnError: false
  });

  const style = {} as CSSProperties;

  if (inline) {
    style.display = 'inline-block';
  }

  return (
    <div style={style} dangerouslySetInnerHTML={{ __html }} />
  );
};
