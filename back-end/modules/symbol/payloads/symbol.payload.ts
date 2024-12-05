import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';

export class SymbolPayload {
  id: string;
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  axiomAppearanceCount: number;
  theoremAppearanceCount: number;
  deductionAppearanceCount: number;
  systemId: string;
  createdByUserId: string;

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, systemId, createdByUserId } = symbol;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomAppearanceCount = axiomAppearanceCount;
    this.theoremAppearanceCount = theoremAppearanceCount;
    this.deductionAppearanceCount = deductionAppearanceCount;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
