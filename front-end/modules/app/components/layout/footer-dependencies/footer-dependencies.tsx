import packageJson from '#/package.json';
import { fetchBackEndDependencies } from '@/app/fetch-data/fetch-back-end-dependencies';
import { fetchBackEndDevDependencies } from '@/app/fetch-data/fetch-back-end-dev-dependencies';
import { AntdCollapse } from '@/common/components/antd-collapse/antd-collapse';
import { CollapsibleType } from 'antd/es/collapse/CollapsePanel';
import { ReactElement } from 'react';
import { DependenciesBlock } from './dependencies-block/dependencies-block';

export const FooterDependencies = async (): Promise<ReactElement> => {
  const [backEndDependencies, backEndDevDependencies] = await Promise.all([
    fetchBackEndDependencies(),
    fetchBackEndDevDependencies()
  ]);
  const { dependencies, devDependencies } = packageJson;

  const items = [
    {
      children: (
        <DependenciesBlock packages={backEndDependencies} />
      ),
      collapsible: 'icon' as CollapsibleType,
      key: 'back-end-dependencies',
      label: 'Back End Dependencies',
      showArrow: false
    },
    {
      children: (
        <DependenciesBlock packages={backEndDevDependencies} />
      ),
      collapsible: 'icon' as CollapsibleType,
      key: 'back-end-dev-dependencies',
      label: 'Back End Development Dependencies',
      showArrow: false
    },
    {
      children: (
        <DependenciesBlock packages={dependencies} />
      ),
      collapsible: 'icon' as CollapsibleType,
      key: 'front-end-dependencies',
      label: 'Front End Dependencies',
      showArrow: false
    },
    {
      children: (
        <DependenciesBlock packages={devDependencies} />
      ),
      collapsible: 'icon' as CollapsibleType,
      key: 'front-end-dev-dependencies',
      label: 'Front End Development Dependencies',
      showArrow: false
    }
  ];

  const keys = items.map((item): string => {
    const { key } = item;

    return key;
  });

  return (
    <AntdCollapse defaultActiveKey={keys} items={items} />
  );
};
