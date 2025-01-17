export type Statement = {
  id: string;
  title: string;
  description: string;
  distinctVariableRestrictions: [string, string][];
  variableTypeHypotheses: [string, string][];
  logicalHypotheses: string[][];
  assertion: string[];
  proofCount: number;
  proofAppearanceCount: number;
  systemId: string;
  createdByUserId: string;
};
