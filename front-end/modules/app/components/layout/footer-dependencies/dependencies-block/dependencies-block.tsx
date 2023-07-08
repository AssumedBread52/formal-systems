import { DependenciesBlockProps } from '@/app/types/dependencies-block-props';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { ReactElement } from 'react';
import { DependencyItem } from './dependency-item/dependency-item';

export const DependenciesBlock = (props: DependenciesBlockProps): ReactElement => {
  const { packages } = props;

  const packageNames = Object.keys(packages);

  return (
    <AntdRow gutter={[4, 4]} justify='start'>
      {packageNames.map((packageName: string): ReactElement => {
        const version = packages[packageName];

        return (
          <AntdCol key={packageName} xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
            <DependencyItem packageName={packageName} version={version} />
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
