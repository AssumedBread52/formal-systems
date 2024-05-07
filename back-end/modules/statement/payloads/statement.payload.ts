import { StatementEntity } from '@/statement/statement.entity';
import { ObjectId } from 'mongodb';

export class StatementPayload {
  id: string;
  title: string;
  description: string;
  distinctVariableRestrictions: [string, string][];
  variableTypeHypotheses: [string, string][];
  logicalHypotheses: string[][];
  proofAppearances: number;
  proofSteps: number;
  assertion: string[];
  systemId: string;
  createdByUserId: string;

  constructor(statement: StatementEntity) {
    const { _id, title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, proofAppearances, proofSteps, systemId, createdByUserId } = statement;

    this.id = _id.toString();
    this.title = title;
    this.description = description;
    this.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
      return [
        distinctVariableRestriction[0].toString(),
        distinctVariableRestriction[1].toString()
      ];
    });
    this.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
      return [
        variableTypeHypothesis[0].toString(),
        variableTypeHypothesis[1].toString()
      ];
    });
    this.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: ObjectId[]): string[] => {
      return logicalHypothesis.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      });
    });
    this.assertion = assertion.map((symbolId: ObjectId): string => {
      return symbolId.toString();
    });
    this.proofAppearances = proofAppearances;
    this.proofSteps = proofSteps;
    this.systemId = systemId.toString();
    this.createdByUserId = createdByUserId.toString();
  }
};
