import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';

export class SymbolPayload {
  id: string;
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  axiomAppearances: number;
  theoremAppearances: number;
  deductionAppearances: number;
  systemId: string;
  createdByUserId: string;

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = symbol;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomAppearances = axiomAppearances;
    this.theoremAppearances = theoremAppearances;
    this.deductionAppearances = deductionAppearances;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
