import { SymbolEntity } from '@/symbol/symbol.entity';
import { ObjectId } from 'mongodb';

export class SymbolRepositoryMock {
  symbols = [] as SymbolEntity[];

  findOneBy = jest.fn((args: Partial<SymbolEntity>): SymbolEntity | null => {
    const { content, systemId } = args;

    for (const symbol of this.symbols) {
      if ((!content || content === symbol.content) && (!systemId || systemId.toString() === symbol.systemId.toString())) {
        return symbol;
      }
    }

    return null;
  });

  save = jest.fn((args: SymbolEntity): SymbolEntity => {
    args._id = new ObjectId();

    this.symbols.push(args);

    return args;
  });
};
