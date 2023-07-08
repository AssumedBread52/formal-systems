import packageJson from '#/package.json';
import { fetchBackEndDependencies } from '@/app/fetch-data/fetch-back-end-dependencies';
import { fetchBackEndDevDependencies } from '@/app/fetch-data/fetch-back-end-dev-dependencies';
import { AntdCollapse } from '@/common/components/antd-collapse/antd-collapse';
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
      key: 'back-end-dependencies',
      label: 'Back End Dependencies'
    },
    {
      children: (
        <DependenciesBlock packages={backEndDevDependencies} />
      ),
      key: 'back-end-dev-dependencies',
      label: 'Back End Development Dependencies'
    },
    {
      children: (
        <DependenciesBlock packages={dependencies} />
      ),
      key: 'front-end-dependencies',
      label: 'Front End Dependencies'
    },
    {
      children: (
        <DependenciesBlock packages={devDependencies} />
      ),
      key: 'front-end-dev-dependencies',
      label: 'Front End Development Dependencies'
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
