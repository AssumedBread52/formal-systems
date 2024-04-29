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

const { useFetchVariableSymbolsQuery } = api;

const { Item, List } = Form;

export const InputDistinctVariableRestrictions = (props: InputProps): ReactElement => {
  const { name } = props;

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data } = useFetchVariableSymbolsQuery(systemId);

  const formInstance = useFormInstance();

  const options = data?.map((symbol: Symbol): DefaultOptionType => {
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
    <Item label={<Fragment>Distinct Variable<br />Restrictions</Fragment>} name={name}>
      <List name={name}>
        {(fields: FormListFieldData[], operation: FormListOperation): ReactNode => {
          const { add, remove } = operation;

          const addHandler = (): void => {
            add();
          };

          const restrictions = formInstance.getFieldValue(name) as ([string, string] | [undefined, string] | [string] | undefined)[] | undefined;

          return (
            <Fragment>
              {fields.map((field: FormListFieldData): ReactElement => {
                const { key, name } = field;

                const rules = [
                  { required: true, message: 'A variable is required.' }
                ] as Rule[];

                const removeHandler = (): void => {
                  remove(name);
                };

                return (
                  <Fragment key={key}>
                    <Item name={[name, 0]} rules={rules}>
                      <Select options={options} />
                    </Item>
                    <Item name={[name, 1]} rules={rules}>
                      <Select options={options} />
                    </Item>
                    <Item>
                      <Button block icon={<MinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                        Remove Distinct Variable Restriction
                      </Button>
                    </Item>
                  </Fragment>
                );
              })}
              <Item>
                <Button block disabled={restrictions?.length === ((data?.length ?? 0) * ((data?.length ?? 0) - 1)) / 2} icon={<PlusCircleOutlined />} type='dashed' onClick={addHandler}>
                  Add Distinct Variable Restriction
                </Button>
              </Item>
            </Fragment>
          );
        }}
      </List>
    </Item>
  );
};
