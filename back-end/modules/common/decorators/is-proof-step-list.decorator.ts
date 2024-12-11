import { arrayMaxSize, arrayMinSize, arrayUnique, buildMessage, isArray, isMongoId, ValidateBy, ValidationOptions } from 'class-validator';

export const IsProofStepListDecorator = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({
    name: 'is-proof-step-list',
    validator: {
      defaultMessage: buildMessage((eachPrefix: string): string => {
        return `${eachPrefix}$property must be a list of proof steps`;
      }, validationOptions),
      validate: (value: any): boolean => {
        if (!isArray(value)) {
          return false;
        }

        for (const step of value) {
          if (!isArray(step)) {
            return false;
          }

          if (!arrayMaxSize(step, 2)) {
            return false;
          }

          if (!arrayMinSize(step, 2)) {
            return false;
          }

          const [statementId, substitutions] = step;

          if (!isMongoId(statementId)) {
            return false;
          }

          if (!isArray(substitutions)) {
            return false;
          }

          for (const substitution of substitutions) {
            if (!isArray(substitution)) {
              return false;
            }

            if (!arrayMaxSize(substitution, 2)) {
              return false;
            }

            if (!arrayMinSize(substitution, 2)) {
              return false;
            }

            const [variableSymbolId, expression] = substitution;

            if (!isMongoId(variableSymbolId)) {
              return false;
            }

            if (!isArray(expression)) {
              return false;
            }

            for (const symbolId of expression) {
              if (!isMongoId(symbolId)) {
                return false;
              }
            }
          }
        }

        if (!arrayUnique(value, (step: [string, [string, string[]][]]): string => {
          const [statementId, substitutions] = step;

          return `${statementId}{${substitutions.map((substitution: [string, string[]]): string => {
            const [variableSymbolId, expression] = substitution;

            return `${variableSymbolId}:${expression.join('|')}`;
          }).join(',')}}`;
        })) {
          return false;
        }

        return true;
      }
    }
  }, validationOptions);
};
