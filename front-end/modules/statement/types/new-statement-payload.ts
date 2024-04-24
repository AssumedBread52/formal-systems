export type NewStatementPayload = {
  title: string;
  description: string;
  distinctVariableRestrictions: [string, string][];
  variableTypeHypotheses: [string, string][];
  logicalHypotheses: string[][];
  assertion: string[];
  systemId: string;
};
