import { DependenciesBlockProps } from '@/app/types/dependencies-block-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { ReactElement } from 'react';

export const DependenciesBlock = (props: DependenciesBlockProps): ReactElement => {
  const { packages } = props;

  const packageNames = Object.keys(packages);

  return (
    <AntdRow gutter={[4, 4]} justify='start'>
      {packageNames.map((packageName: string): ReactElement => {
        const version = packages[packageName];

        return (
          <AntdCol key={packageName} xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
            <AntdCard bodyStyle={{ textAlign: 'center' }} extra={<a href={`https://www.npmjs.com/package/${packageName}`} target='_blank'>Explore</a>} title={packageName} type='inner'>
              version: {version.substring(1)}
            </AntdCard>
          </AntdCol>
        );
      })}
    </AntdRow>
  );
};
