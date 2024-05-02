import { RenderMath } from '@/common/components/render-math/render-math';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { DisplayExpressionProps } from '@/symbol/types/display-expression-props';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';

export const DisplayExpression = async (props: DisplayExpressionProps): Promise<ReactElement> => {
  const { symbolIds, systemId } = props;

  const symbols = await Promise.all(symbolIds.map((symbolId: string): Promise<Symbol> => {
    return fetchSymbol(systemId, symbolId);
  }));

  const content = symbols.reduce((expression: string, symbol: Symbol): string => {
    const { content } = symbol;

    return `${expression}${content}`;
  }, '');

  return (
    <RenderMath content={content} inline />
  );
};
