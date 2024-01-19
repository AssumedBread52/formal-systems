import { DependencyItemProps } from '@/app/types/dependency-item-props';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { ReactElement } from 'react';

export const DependencyItem = (props: DependencyItemProps): ReactElement => {
  const { packageName, version } = props;

  const explorePackageLink = (
    <a href={`https://www.npmjs.com/package/${packageName}`} target='_blank'>
      Explore
    </a>
  );

  return (
    <AntdCard bodyStyle={{ textAlign: 'center' }} extra={explorePackageLink} title={packageName} type='inner'>
      version: {version.substring(1)}
    </AntdCard>
  );
};
