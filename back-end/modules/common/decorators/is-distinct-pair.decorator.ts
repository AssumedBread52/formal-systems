import { ValidateBy, ValidationOptions, arrayMaxSize, arrayMinSize, arrayUnique, buildMessage, isArray, isMongoId } from 'class-validator';

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

        const first = `${value[0]}`;
        const second = `${value[1]}`;

        if (!isMongoId(first)) {
          return false;
        }

        if (!isMongoId(second)) {
          return false;
        }

        if (!arrayUnique(value, (item: any): string => {
          return `${item}`;
        })) {
          return false;
        }

        return true;
      },
    }
  }, validationOptions);
};
