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
    <AntdCard styles={{ body: { textAlign: 'center' } }} extra={explorePackageLink} title={packageName}>
      version: {version}
    </AntdCard>
  );
};
