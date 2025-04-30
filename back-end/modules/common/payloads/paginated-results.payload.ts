export class PaginatedResultsPayload<Entity> {
  results: Entity[];
  total: number;

  constructor(entities: Entity[], total: number) {
    this.results = entities;
    this.total = total;
  }
};
