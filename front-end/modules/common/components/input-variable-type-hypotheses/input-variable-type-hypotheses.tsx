'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { Symbol } from '@/symbol/types/symbol';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, FormListFieldData, FormListOperation, Select } from 'antd';
import { Rule } from 'antd/es/form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { DefaultOptionType } from 'antd/es/select';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode } from 'react';

const { useFetchConstantSymbolsQuery, useFetchVariableSymbolsQuery } = api;

const { Item, List } = Form;

export const InputVariableTypeHypotheses = (props: InputProps): ReactElement => {
  const { name } = props;

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data: constantSymbols } = useFetchConstantSymbolsQuery(systemId);
  const { data: variableSymbols } = useFetchVariableSymbolsQuery(systemId);

  const formInstance = useFormInstance();

  const constantOptions = constantSymbols?.map((symbol: Symbol): DefaultOptionType => {
    const { id, title, content } = symbol;

    return {
      label: (
        <Flex justify='space-between'>
          {title}
          <RenderMath content={content} inline />
        </Flex>
      ),
      value: id
    };
  });

  return (
    <Item label={<Fragment>Variable Type<br />Hypotheses</Fragment>} name={name}>
      <List name={name}>
        {(fields: FormListFieldData[], operation: FormListOperation): ReactNode => {
          const { add, remove } = operation;

          const addHandler = (): void => {
            add();
          };

          const typeHypotheses = formInstance.getFieldValue(name) as ([string, string] | [undefined, string] | [string] | undefined)[] | undefined;

          const usedVariableSymbols = (typeHypotheses ?? []).reduce((usedVariableSymbols: string[], typeHypothesis: [string, string] | [undefined, string] | [string] | undefined): string[] => {
            if (!typeHypothesis || typeHypothesis.length !== 2) {
              return usedVariableSymbols;
            }

            usedVariableSymbols.push(typeHypothesis[1]);

            return usedVariableSymbols;
          }, []);

          return (
            <Fragment>
              {fields.map((field: FormListFieldData): ReactElement => {
                const { key, name } = field;

                const constantSymbolRules = [
                  { required: true, message: 'A type is required.' }
                ] as Rule[];
                const variableSymbolRules = [
                  { required: true, message: 'A variable is required.' }
                ] as Rule[];

                const removeHandler = (): void => {
                  remove(name);
                };

                return (
                  <Fragment key={key}>
                    <Item name={[name, 0]} rules={constantSymbolRules}>
                      <Select options={constantOptions} />
                    </Item>
                    <Item name={[name, 1]} rules={variableSymbolRules}>
                      <Select options={variableSymbols?.map((symbol: Symbol): DefaultOptionType => {
                        const { id, title, content } = symbol;

                        return {
                          disabled: usedVariableSymbols.includes(id),
                          label: (
                            <Flex justify='space-between'>
                              {title}
                              <RenderMath content={content} inline />
                            </Flex>
                          ),
                          value: id
                        };
                      })} />
                    </Item>
                    <Button block icon={<MinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                      Remove Variable Type Hypothesis
                    </Button>
                  </Fragment>
                );
              })}
              <Item>
                <Button block disabled={variableSymbols?.length === typeHypotheses?.length} icon={<PlusCircleOutlined />} type='dashed' onClick={addHandler}>
                  Add Variable Type Hypothesis
                </Button>
              </Item>
            </Fragment>
          );
        }}
      </List>
    </Item>
  );
};
