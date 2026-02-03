import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';

export class SymbolPayload {
  id: string;
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  axiomAppearanceCount: number;
  theoremAppearanceCount: number;
  deductionAppearanceCount: number;
  proofAppearanceCount: number;
  systemId: string;
  createdByUserId: string;

  constructor(symbol: SymbolEntity) {
    const { _id, title, description, type, content, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, systemId, createdByUserId } = symbol;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.type = type;
    this.content = content;
    this.axiomAppearanceCount = axiomAppearanceCount;
    this.theoremAppearanceCount = theoremAppearanceCount;
    this.deductionAppearanceCount = deductionAppearanceCount;
    this.proofAppearanceCount = proofAppearanceCount;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
