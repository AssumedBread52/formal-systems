export type EditStatementPayload = {
  id: string;
  newTitle: string;
  newDescription: string;
  newDistinctVariableRestrictions: [string, string][];
  newVariableTypeHypotheses: [string, string][];
  newLogicalHypotheses: string[][];
  newAssertion: string[];
  systemId: string;
};
