export class EntityRepositoryMock<Entity> {
  entities = [] as Entity[];

  save = jest.fn((entity: Entity): Entity => {
    this.entities.push(entity);

    return entity;
  });
};
