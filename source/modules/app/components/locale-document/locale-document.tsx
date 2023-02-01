import { Head, Html, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';

export const LocaleDocument = (): ReactElement => {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
