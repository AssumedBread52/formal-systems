import { AppParams } from './app-params';
import { QueryParams } from './query-params';

export type ServerSideProps = {
  params: AppParams;
  searchParams: QueryParams;
};
