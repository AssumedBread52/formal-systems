import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdEmpty } from '@/common/components/antd-empty/antd-empty';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { Symbol } from '@/symbol/types/symbol';
import { SymbolListProps } from '@/symbol/types/symbol-list-props';
import { ReactElement } from 'react';
import { SymbolItem } from './symbol-item/symbol-item';

export const SymbolList = (props: SymbolListProps): ReactElement => {
  const { symbols, systemTitle } = props;

  if (0 === symbols.length) {
    return (
      <AntdEmpty>
        No symbols were found matching your search criteria.
      </AntdEmpty>
    );
  }

  return (
    <AntdRow gutter={[0, 16]}>
      {symbols.map((symbol: Symbol): ReactElement => {
        const { id, title, description, type, content, systemId, createdByUserId } = symbol;

        return (
          <AntdCol key={id} span={24}>
            <SymbolItem id={id} title={title} description={description} type={type} content={content} systemId={systemId} createdByUserId={createdByUserId} systemTitle={systemTitle} />
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
