import { PropsWithChildren, ReactElement } from 'react';

export const CreateSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;
  return (
    <h1>
      {children}
    </h1>
  );
};
