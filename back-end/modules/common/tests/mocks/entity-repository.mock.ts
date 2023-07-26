export class EntityRepositoryMock<Entity> {
  entities = [] as Entity[];

  findAndCount = jest.fn((): [Entity[], number] => {
    return [
      this.entities,
      this.entities.length
    ];
  });

  save = jest.fn((entity: Entity): Entity => {
    this.entities.push(entity);

    return entity;
  });
};
