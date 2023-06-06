import { PropsWithChildren, ReactElement } from 'react';

export default function RootLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;

  return (
    <html lang='en'>
      <head>
        <link href='index.css' rel='stylesheet' />
      </head>
      <body>
        <header>
          Header!
        </header>
        <main>
          {children}
        </main>
        <footer>
          Footer!
        </footer>
      </body>
    </html>
  );
}
