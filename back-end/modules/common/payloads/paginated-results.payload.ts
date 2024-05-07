export class PaginatedResultsPayload<Entity, Payload> {
  results: Payload[];
  total: number;

  constructor(PayloadConstructor: new (entity: Entity) => Payload, entities: Entity[], total: number) {
    this.results = entities.map((entity: Entity): Payload => {
      return new PayloadConstructor(entity);
    });
    this.total = total;
  }
};
