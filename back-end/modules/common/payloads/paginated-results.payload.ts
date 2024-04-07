import { IsArray, IsInt, Min } from 'class-validator';

export class PaginatedResultsPayload<Entity, Payload> {
  @IsArray()
  results: Payload[];
  @IsInt()
  @Min(0)
  total: number;

  constructor(PayloadConstructor: new (entity: Entity) => Payload, entities: Entity[], total: number) {
    this.results = entities.map((entity: Entity): Payload => {
      return new PayloadConstructor(entity);
    });
    this.total = total;
  }
};
