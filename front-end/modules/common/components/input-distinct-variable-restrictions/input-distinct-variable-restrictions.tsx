'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { Symbol } from '@/symbol/types/symbol';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, FormListFieldData, FormListOperation, Select, Space } from 'antd';
import { Rule } from 'antd/es/form';
import { DefaultOptionType } from 'antd/es/select';
import { useParams } from 'next/navigation';
import { Fragment, ReactElement, ReactNode } from 'react';

const { useFetchVariableSymbolsQuery } = api;

const { Item, List } = Form;

export const InputDistinctVariableRestrictions = (props: InputProps): ReactElement => {
  const { name } = props;

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { data } = useFetchVariableSymbolsQuery(systemId);

  const options = data?.map((symbol: Symbol): DefaultOptionType => {
    const { id, title, content } = symbol;

    return {
      label: (
        <Flex justify='space-between'>
          {title}
          <Space>
            <span />
            <span />
          </Space>
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
            add([]);
          };

          return (
            <Fragment>
              <Flex vertical>
                {fields.map((field: FormListFieldData): ReactElement => {
                  const { key, name } = field;

                  const rules = [
                    { len: 2, message: 'A variable pair is required.', type: 'array' }
                  ] as Rule[];

                  const removeHandler = (): void => {
                    remove(name);
                  };

                  return (
                    <Fragment key={key}>
                      <Item name={name} rules={rules}>
                        <Select maxCount={2} mode='multiple' options={options} />
                      </Item>
                      <Item>
                        <Button block icon={<MinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                          Remove Distinct Variable Restriction
                        </Button>
                      </Item>
                    </Fragment>
                  );
                })}
              </Flex>
              <Item>
                <Button block icon={<PlusCircleOutlined />} type='dashed' onClick={addHandler}>
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
