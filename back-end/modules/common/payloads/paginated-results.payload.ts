import { ClassConstructor } from 'class-transformer';

export class PaginatedResultsPayload<Entity, Payload> {
  results: Payload[];
  total: number;

  constructor(PayloadConstructor: ClassConstructor<Payload>, entities: Entity[], total: number) {
    this.results = entities.map((entity: Entity): Payload => {
      return new PayloadConstructor(entity);
    });
    this.total = total;
  }
};
