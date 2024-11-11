import { arrayMaxSize, arrayMinSize, arrayUnique, buildMessage, isArray, isMongoId, ValidateBy, ValidationOptions } from 'class-validator';

export const IsDistinctPairDecorator = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({
    name: 'is-distinct-pair',
    validator: {
      defaultMessage: buildMessage((eachPrefix: string): string => {
        return `${eachPrefix}$property must be a distinct pair of mongodb ids`;
      }, validationOptions),
      validate: (value: any): boolean => {
        if (!isArray(value)) {
          return false;
        }

        if (!arrayMaxSize(value, 2)) {
          return false;
        }

        if (!arrayMinSize(value, 2)) {
          return false;
        }

        const [first, second] = value;

        if (!isMongoId(first)) {
          return false;
        }

        if (!isMongoId(second)) {
          return false;
        }

        if (!arrayUnique(value, (item: string): string => {
          return item;
        })) {
          return false;
        }

        return true;
      }
    }
  }, validationOptions);
};
