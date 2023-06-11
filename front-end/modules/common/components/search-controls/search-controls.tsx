import { PropsWithChildren, ReactElement } from 'react';

export const SearchControls = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <div>
      {children}
    </div>
  );
};
