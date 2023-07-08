import '#/public/index.css';
import { AntdLayoutContent } from '@/common/components/antd-layout-content/antd-layout-content';
import { AntdLayoutFooter } from '@/common/components/antd-layout-footer/antd-layout-footer';
import { AntdLayoutHeader } from '@/common/components/antd-layout-header/antd-layout-header';
import { AntdLayout } from '@/common/components/antd-layout/antd-layout';
import { Metadata } from 'next';
import { PropsWithChildren, ReactElement } from 'react';
import { AppProvider } from './app-provider/app-provider';
import { FooterDependencies } from './footer-dependencies/footer-dependencies';
import { HeaderMenu } from './header-menu/header-menu';

export const Layout = async (props: PropsWithChildren): Promise<ReactElement> => {
  const { children } = props;

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
              <FooterDependencies />
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
