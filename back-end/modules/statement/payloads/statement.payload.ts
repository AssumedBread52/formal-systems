import { StatementEntity } from '@/statement/statement.entity';
import { ObjectId } from 'mongodb';

export class StatementPayload {
  id: string;
  title: string;
  description: string;
  distinctVariableRestrictions: [string, string][];
  variableTypeHypotheses: [string, string][];
  logicalHypotheses: [string, ...string[]][];
  assertion: [string, ...string[]];
  proofAppearances: number;
  proofSteps: number;
  systemId: string;
  createdByUserId: string;

  constructor(statement: StatementEntity) {
    const { _id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, proofAppearances, proofSteps, systemId, createdByUserId } = statement;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
      const [first, second] = distinctVariableRestriction;

      return [
        first.toString(),
        second.toString()
      ];
    });
    this.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
      const [type, variable] = variableTypeHypothesis;

      return [
        type.toString(),
        variable.toString()
      ];
    });
    this.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: [ObjectId, ...ObjectId[]]): [string, ...string[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        prefix.toString(),
        ...expression.map((symbolId: ObjectId): string => {
          return symbolId.toString();
        })
      ];
    });
    const [prefix, ...expression] = assertion;
    this.assertion = [
      prefix.toString(),
      ...expression.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      })
    ];
    this.proofAppearances = proofAppearances;
    this.proofSteps = proofSteps;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
