import { Fragment, PropsWithChildren, ReactElement } from 'react';

export const CreateSymbolForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <Fragment>
      {children}
    </Fragment>
  );
};
