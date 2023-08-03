import { SymbolEntity } from '@/symbol/symbol.entity';

export class SymbolRepositoryMock {
  findAndCount = jest.fn();

  findOneBy = jest.fn();

  remove = jest.fn((symbol: SymbolEntity): SymbolEntity => {
    return symbol;
  });

  save = jest.fn((symbol: SymbolEntity): SymbolEntity => {
    return symbol;
  });
};
