import { buildMessage, isArray, isMongoId, ValidateBy, ValidationOptions } from 'class-validator';

export const IsExpressionDecorator = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({
    name: 'is-expression',
    validator: {
      defaultMessage: buildMessage((eachPrefix: string): string => {
        return `${eachPrefix}each value in $property must be a mongodb id`;
      }, validationOptions),
      validate: (value: any): boolean => {
        if (!isArray(value)) {
          return false;
        }

        for (let item of value) {
          if (!isMongoId(item)) {
            return false;
          }
        }

        return true;
      }
    }
  }, validationOptions);
};
