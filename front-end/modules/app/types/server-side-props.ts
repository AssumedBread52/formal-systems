import { QueryParams } from './query-params';
import { RouteParams } from './route-params';

export type ServerSideProps = {
  params: RouteParams;
  searchParams: QueryParams;
};
