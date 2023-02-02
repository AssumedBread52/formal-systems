import packageJson from '#/package.json';
import { ReactElement } from 'react';
import { DependencyList } from './dependency-list/dependency-list';

export const Footer = (): ReactElement => {
  const { dependencies, devDependencies } = packageJson;

  return (
    <footer>
      <DependencyList label='Production Dependencies' list={dependencies} />
      <DependencyList label='Development Dependencies' list={devDependencies} />
    </footer>
  );
};
