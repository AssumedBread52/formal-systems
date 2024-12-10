import { ProofEntity } from '@/proof/proof.entity';
import { ObjectId } from 'mongodb';

export class ProofPayload {
  id: string;
  title: string;
  description: string;
  steps: [string, [string, string[]][]][];
  statementId: string;
  systemId: string;
  createdByUserId: string;

  constructor(proof: ProofEntity) {
    const { _id, title, description, steps, statementId, systemId, createdByUserId } = proof;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.steps = steps.map((step: [ObjectId, [ObjectId, ObjectId[]][]]): [string, [string, string[]][]] => {
      const [statementId, substitutions] = step;

      return [
        statementId.toString(),
        substitutions.map((substitution: [ObjectId, ObjectId[]]): [string, string[]] => {
          const [variableSymbolId, expression] = substitution;

          return [
            variableSymbolId.toString(),
            expression.map((symbolId: ObjectId): string => {
              return symbolId.toString();
            })
          ];
        })
      ];
    });
    this.statementId = statementId.toString();
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
