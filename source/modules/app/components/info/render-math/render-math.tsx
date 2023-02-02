import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PropsWithChildren, ReactElement, useCallback } from 'react';

interface IRenderMathProps {
  inline?: boolean;
  content?: string;
}

const renderMath = (node: HTMLSpanElement, content: string, inline?: boolean, nodeForError?: HTMLSpanElement): void => {
  try {
    katex.render(content, node, {
      displayMode: !inline
    });
  } catch {
    const errorMessage = document.createTextNode('Error rendering.');

    if (nodeForError) {
      nodeForError.append(errorMessage);
    } else {
      node.append(errorMessage);
    }
  }
};

export const RenderMath = (props: PropsWithChildren<IRenderMathProps>): ReactElement => {
  const { children, content, inline } = props;

  const linkedHandler = useCallback((node: HTMLSpanElement | null): void => {
    if (node) {
      if (typeof content === 'string') {
        renderMath(node, content, inline);
      } else if (typeof node.textContent === 'string') {
        if (inline) {
          const textBlocks = node.textContent.split('$$');
          node.textContent = '';

          textBlocks.forEach((textBlock: string, index: number): void => {
            if (0 === index % 2) {
              node.append(textBlock);
            } else {
              const span = document.createElement('span');

              renderMath(span, textBlock, inline, node);

              node.append(span);
            }
          });
        } else {
          renderMath(node, node.textContent, inline);
        }
      }
    }
  }, [content, inline]);

  return (
    <span ref={linkedHandler}>
      {children}
    </span>
  );
};
