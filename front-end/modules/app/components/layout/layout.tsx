import { AntdLayoutContent } from '@/common/components/antd-layout-content/antd-layout-content';
import { AntdLayoutFooter } from '@/common/components/antd-layout-footer/antd-layout-footer';
import { AntdLayoutHeader } from '@/common/components/antd-layout-header/antd-layout-header';
import { AntdLayout } from '@/common/components/antd-layout/antd-layout';
import { PropsWithChildren, ReactElement } from 'react';

export const Layout = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <html lang='en'>
      <head>
        <link href='index.css' rel='stylesheet' />
      </head>
      <body>
        <AntdLayout>
          <AntdLayoutHeader />
          <AntdLayoutContent>
            {children}
          </AntdLayoutContent>
          <AntdLayoutFooter />
        </AntdLayout>
      </body>
    </html>
  );
};
