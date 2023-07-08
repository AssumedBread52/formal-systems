import packageJson from '#/package.json';
import { AntdCollapse } from '@/common/components/antd-collapse/antd-collapse';
import { ReactElement } from 'react';
import { DependenciesBlock } from './dependencies-block/dependencies-block';

export const FooterDependencies = async (): Promise<ReactElement> => {
  const backEndDependenciesResponse = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/app/dependencies`);
  const backEndDevDependenciesResponse = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/app/dev-dependencies`);
  const { dependencies, devDependencies } = packageJson;

  const items = [
    {
      children: (
        <DependenciesBlock packages={await backEndDependenciesResponse.json()} />
      ),
      key: 'back-end-dependencies',
      label: 'Back End Dependencies'
    },
    {
      children: (
        <DependenciesBlock packages={await backEndDevDependenciesResponse.json()} />
      ),
      key: 'back-end-development-dependencies',
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
      key: 'front-end-development-dependencies',
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
