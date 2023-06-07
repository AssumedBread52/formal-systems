import { DependenciesBlockProps } from '@/app/types/dependencies-block-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { ReactElement } from 'react';
import { ExploreDependency } from './explore-dependency/explore-dependency';

export const DependenciesBlock = (props: DependenciesBlockProps): ReactElement => {
  const { label, packages } = props;

  const packageNames = Object.keys(packages);

  return (
    <AntdCard bodyStyle={{ padding: 0 }} bordered={false} className='ant-card-contain-grid' title={label}>
      {packageNames.map((packageName: string): ReactElement => {
        const version = packages[packageName];

        return (
          <ExploreDependency packageName={packageName}>
            <AntdSpace direction='vertical' size={0}>
              <em>
                {packageName}
              </em>
              <span>
                version: {version.substring(1)}
              </span>
            </AntdSpace>
          </ExploreDependency>
        );
      })}
    </AntdCard>
  );
};
