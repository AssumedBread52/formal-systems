import { AppType } from 'next/app';
import { AppPropsType } from 'next/dist/shared/lib/utils';
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { ServerStyleSheet } from 'styled-components';

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

LocaleDocument.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  const serverStyleSheet = new ServerStyleSheet();
  const { renderPage: originalRenderPage } = ctx;

  try {
    ctx.renderPage = (): DocumentInitialProps | Promise<DocumentInitialProps> => {
      return originalRenderPage({
        enhanceApp: (App: AppType): AppType => {
          return (props: AppPropsType): ReactElement => {
            return serverStyleSheet.collectStyles(<App {...props} />);
          };
        }
      });
    };

    const initialProps = await Document.getInitialProps(ctx);
    const { styles } = initialProps;

    return {
      ...initialProps,
      styles: [
        styles,
        serverStyleSheet.getStyleElement()
      ]
    };
  } finally {
    serverStyleSheet.seal();
  }
};
