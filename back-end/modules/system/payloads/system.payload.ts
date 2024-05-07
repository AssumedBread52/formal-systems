import { SystemEntity } from '@/system/system.entity';

export class SystemPayload {
  id: string;
  title: string;
  description: string;
  constantSymbolCount: number;
  variableSymbolCount: number;
  axiomCount: number;
  theoremCount: number;
  deductionCount: number;
  createdByUserId: string;

  constructor(system: SystemEntity) {
    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = system;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
    this.axiomCount = axiomCount;
    this.theoremCount = theoremCount;
    this.deductionCount = deductionCount;
    this.createdByUserId = createdByUserId.toString();
  }
};
