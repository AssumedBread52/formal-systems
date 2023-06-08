import { AppProvider } from '@/app/components/app-provider/app-provider';
import { AntdLayoutContent } from '@/common/components/antd-layout-content/antd-layout-content';
import { AntdLayoutFooter } from '@/common/components/antd-layout-footer/antd-layout-footer';
import { AntdLayoutHeader } from '@/common/components/antd-layout-header/antd-layout-header';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { Metadata } from 'next';
import { PropsWithChildren, ReactElement } from 'react';
import { DependenciesBlock } from './dependencies-block/dependencies-block';
import { HeaderMenu } from './header-menu/header-menu';

export const Layout = async (props: PropsWithChildren): Promise<ReactElement> => {
  const { children } = props;

  const backEndDependenciesResponse = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/app/dependencies`);
  const backEndDevDependenciesResponse = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/app/dev-dependencies`);
  const frontEndDependenciesResponse = await fetch(`http://localhost:${process.env.PORT}/app/dependencies`);
  const frontEndDevDependenciesResponse = await fetch(`http://localhost:${process.env.PORT}/app/dev-dependencies`);

  return (
    <html lang='en'>
      <head>
        <link href='index.css' rel='stylesheet' />
      </head>
      <body>
        <AppProvider>
          <AntdLayoutHeader>
            <HeaderMenu />
          </AntdLayoutHeader>
          <AntdLayoutContent>
            {children}
          </AntdLayoutContent>
          <AntdLayoutFooter>
            <AntdSpace direction='vertical'>
              {backEndDependenciesResponse.ok && (
                <DependenciesBlock label='Back End Dependencies' packages={await backEndDependenciesResponse.json()} />
              )}
              {backEndDevDependenciesResponse.ok && (
                <DependenciesBlock label='Back End Development Dependencies' packages={await backEndDevDependenciesResponse.json()} />
              )}
              {frontEndDependenciesResponse.ok && (
                <DependenciesBlock label='Front End Dependencies' packages={await frontEndDependenciesResponse.json()} />
              )}
              {frontEndDevDependenciesResponse.ok && (
                <DependenciesBlock label='Front End Development Dependencies' packages={await frontEndDevDependenciesResponse.json()} />
              )}
            </AntdSpace>
          </AntdLayoutFooter>
        </AppProvider>
      </body>
    </html>
  );
};

export const metadata = {
  title: 'Formal Systems',
  description: 'This web app is a tool that enables users to learn about formal systems through interaction. "Play is the highest form of research" - Albert Einstein'
} as Metadata;
