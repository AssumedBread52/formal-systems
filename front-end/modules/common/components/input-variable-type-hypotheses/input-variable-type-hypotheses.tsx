'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFlex } from '@/common/components/antd-flex/antd-flex';
import { AntdFormErrorList } from '@/common/components/antd-form-error-list/antd-form-error-list';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdFormList } from '@/common/components/antd-form-list/antd-form-list';
import { AntdMinusCircleOutlined } from '@/common/components/antd-minus-circle-outlined/antd-minus-circle-outlined';
import { AntdPlusCircleOutlined } from '@/common/components/antd-plus-circle-outlined/antd-plus-circle-outlined';
import { AntdSelect } from '@/common/components/antd-select/antd-select';
import { RenderMath } from '@/common/components/render-math/render-math';
import { InputProps } from '@/common/types/input-props';
import { Symbol } from '@/symbol/types/symbol';
import { FormListFieldData, FormListOperation } from 'antd';
import { RuleObject } from 'antd/es/form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { DefaultOptionType } from 'antd/es/select';
import { useParams } from 'next/navigation';
import { ValidatorRule } from 'rc-field-form/lib/interface';
import { Fragment, ReactElement, ReactNode } from 'react';

const { useFetchConstantSymbolsQuery, useFetchVariableSymbolsQuery } = api;

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
        <AntdFlex justify='space-between'>
          {title}
          <RenderMath content={content} inline />
        </AntdFlex>
      ),
      value: id
    };
  });

  const rules = [
    {
      message: 'All variables in the assertion or any logical hypothesis must be typed.',
      validator: (currentRule: RuleObject, variableTypeHypotheses: ([string, string] | [undefined, string] | [string] | [])[] = []): Promise<any | void> => {
        const { message } = currentRule;

        const assertion = (formInstance.getFieldValue('assertion') ?? formInstance.getFieldValue('newAssertion') ?? []) as string[];
        const logicalHypotheses = (formInstance.getFieldValue('logicalHypotheses') ?? formInstance.getFieldValue('newLogicalHypotheses') ?? []) as string[][];

        const variables = (variableSymbols ?? []).reduce((dictionary: Record<string, boolean>, symbol: Symbol): Record<string, boolean> => {
          const { id } = symbol;

          dictionary[id] = true;

          return dictionary;
        }, {});

        const typedVariables = variableTypeHypotheses.reduce((dictionary: Record<string, boolean>, variableTypeHypothesis: [string, string] | [undefined, string] | [string] | []): Record<string, boolean> => {
          if (2 !== variableTypeHypothesis.length) {
            return dictionary;
          }

          if ('string' !== typeof variableTypeHypothesis[0]) {
            return dictionary;
          }

          dictionary[variableTypeHypothesis[1]] = true;

          return dictionary;
        }, {});

        const symbolIds = assertion.concat(...logicalHypotheses);

        for (const symbolId of symbolIds) {
          if (variables[symbolId] && !typedVariables[symbolId]) {
            return Promise.reject(message);
          }
        }

        return Promise.resolve();
      }
    }
  ] as ValidatorRule[];

  return (
    <AntdFormItem label={<Fragment>Variable Type<br />Hypotheses</Fragment>} name={name}>
      <AntdFormList name={name} rules={rules}>
        {(fields: FormListFieldData[], operation: FormListOperation, meta: { errors: ReactNode[]; warnings: ReactNode[]; }): ReactNode => {
          const { add, remove } = operation;
          const { errors } = meta;

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
              <AntdFlex vertical>
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
                      <AntdFormItem name={[name, 0]} rules={typeRules}>
                        <AntdSelect options={constantOptions} />
                      </AntdFormItem>
                      <AntdFormItem name={[name, 1]} rules={variableRules}>
                        <AntdSelect options={variableSymbols?.map((symbol: Symbol): DefaultOptionType => {
                          const { id, title, content } = symbol;

                          return {
                            disabled: usedVariables[id],
                            label: (
                              <AntdFlex justify='space-between'>
                                {title}
                                <RenderMath content={content} inline />
                              </AntdFlex>
                            ),
                            value: id
                          };
                        })} />
                      </AntdFormItem>
                      <AntdFormItem>
                        <AntdButton block icon={<AntdMinusCircleOutlined />} type='dashed' onClick={removeHandler}>
                          Remove Variable Type Hypothesis
                        </AntdButton>
                      </AntdFormItem>
                    </Fragment>
                  );
                })}
              </AntdFlex>
              <AntdFormItem>
                <AntdButton block disabled={variableSymbols?.length === typeHypotheses?.length} icon={<AntdPlusCircleOutlined />} type='dashed' onClick={addHandler}>
                  Add Variable Type Hypothesis
                </AntdButton>
                <AntdFormErrorList errors={errors} />
              </AntdFormItem>
            </Fragment>
          );
        }}
      </AntdFormList>
    </AntdFormItem>
  );
};
