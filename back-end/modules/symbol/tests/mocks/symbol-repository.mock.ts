import { EntityRepositoryMock } from '@/common/tests/mocks/entity-repository.mock';
import { SymbolEntity } from '@/symbol/symbol.entity';

export class SymbolRepositoryMock extends EntityRepositoryMock<SymbolEntity> {
  findAndCount = jest.fn((): [SymbolEntity[], number] => {
    return [this.entities, this.entities.length];
  });

  findOneBy = jest.fn((args: Partial<SymbolEntity>): SymbolEntity | null => {
    const { _id, content, systemId } = args;

    for (const symbol of this.entities) {
      if ((!_id || _id.toString() === symbol._id.toString()) && (!content || content === symbol.content) && (!systemId || systemId.toString() === symbol.systemId.toString())) {
        return symbol;
      }
    }

    return null;
  });

  remove = jest.fn((args: SymbolEntity): SymbolEntity => {
    const { _id } = args;

    this.entities = this.entities.filter((system: SymbolEntity): boolean => {
      return _id.toString() !== system._id.toString();
    });

    return args;
  });
};
