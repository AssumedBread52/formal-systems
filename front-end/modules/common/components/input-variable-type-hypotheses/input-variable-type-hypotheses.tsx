'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { Symbol } from '@/symbol/types/symbol';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, FormListFieldData, FormListOperation, Select } from 'antd';
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
            add([]);
          };

          const typeHypotheses = formInstance.getFieldValue(name) as ([string, string] | [undefined, string] | [string] | [])[] | undefined;

          const usedVariables = (typeHypotheses ?? []).reduce((usedVariables: Record<string, boolean>, typeHypothesis: [string, string] | [undefined, string] | [string] | []): Record<string, boolean> => {
            if (typeHypothesis.length === 2) {
              usedVariables[typeHypothesis[1]] = true;
            }

            return usedVariables;
          }, {});

          return (
            <Fragment>
              <Flex vertical>
                {fields.map((field: FormListFieldData): ReactElement => {
                  const { key, name } = field;

                  const typeRules = [
                    { required: true, message: 'A type is required.' }
                  ];
                  const variableRules = [
                    { required: true, message: 'A variable is required.' }
                  ];

                  const removeHandler = (): void => {
                    remove(name);
                  };

                  return (
                    <Fragment key={key}>
                      <Item name={[name, 0]} rules={typeRules}>
                        <Select options={constantOptions} />
                      </Item>
                      <Item name={[name, 1]} rules={variableRules}>
                        <Select options={variableSymbols?.map((symbol: Symbol): DefaultOptionType => {
                          const { id, title, content } = symbol;

                          return {
                            disabled: usedVariables[id],
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
                      <Item>
                        <Button block icon={<MinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                          Remove Variable Type Hypothesis
                        </Button>
                      </Item>
                    </Fragment>
                  );
                })}
              </Flex>
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
