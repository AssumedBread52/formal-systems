import katex from 'katex';

export const renderMath = (node: HTMLSpanElement, content: string, inline?: boolean, nodeForError?: HTMLSpanElement): void => {
  try {
    katex.render(content, node, {
      displayMode: !inline
    });
  } catch {
    const errorMessage = document.createTextNode('Error rendering');

    if (nodeForError) {
      nodeForError.append(errorMessage);
    } else {
      node.append(errorMessage);
    }
  }
};
