import { ValidateBy, ValidationOptions, buildMessage, isMongoId } from 'class-validator';

export const IsExpressionDecorator = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({
    name: 'is-expression',
    validator: {
      validate: (value: any): boolean => {
        if (!Array.isArray(value)) {
          return false;
        }

        for (let item of value) {
          if (!isMongoId(`${item}`)) {
            return false;
          }
        }

        return true;
      },
      defaultMessage: buildMessage((eachPrefix: string): string => {
        return `${eachPrefix}each value in $property must be a mongodb id`;
      }, validationOptions)
    }
  }, validationOptions);
};
