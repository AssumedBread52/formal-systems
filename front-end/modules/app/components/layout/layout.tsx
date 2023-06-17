import packageJson from '#/package.json';
import '#/public/index.css';
import { AntdCollapse } from '@/common/components/antd-collapse/antd-collapse';
import { AntdLayoutContent } from '@/common/components/antd-layout-content/antd-layout-content';
import { AntdLayoutFooter } from '@/common/components/antd-layout-footer/antd-layout-footer';
import { AntdLayoutHeader } from '@/common/components/antd-layout-header/antd-layout-header';
import { AntdLayout } from '@/common/components/antd-layout/antd-layout';
import { Metadata } from 'next';
import { PropsWithChildren, ReactElement } from 'react';
import { AppProvider } from './app-provider/app-provider';
import { DependenciesBlock } from './dependencies-block/dependencies-block';
import { HeaderMenu } from './header-menu/header-menu';

export const Layout = async (props: PropsWithChildren): Promise<ReactElement> => {
  const { children } = props;

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

  return (
    <html lang='en'>
      <body>
        <AppProvider>
          <AntdLayout>
            <AntdLayoutHeader>
              <HeaderMenu />
            </AntdLayoutHeader>
            <AntdLayoutContent style={{ padding: '50px' }}>
              {children}
            </AntdLayoutContent>
            <AntdLayoutFooter>
              <AntdCollapse defaultActiveKey={['back-end-dependencies', 'back-end-development-dependencies', 'front-end-dependencies', 'front-end-development-dependencies']} items={items} />
            </AntdLayoutFooter>
          </AntdLayout>
        </AppProvider>
      </body>
    </html>
  );
};

export const metadata = {
  description: 'This web app is a tool that enables users to learn about formal systems through interaction. "Play is the highest form of research" - Albert Einstein',
  title: 'Formal Systems'
} as Metadata;
