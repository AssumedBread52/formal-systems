import { ValidateBy, ValidationOptions, buildMessage, isMongoId } from 'class-validator';

export const IsMongoIdDecorator = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return ValidateBy({
    name: 'is-mongo-id',
    validator: {
      validate: (value: any): boolean => {
        return isMongoId(value) || (typeof value === 'object' && isMongoId(value.toString()));
      },
      defaultMessage: buildMessage((eachPrefix: string): string => {
        return `${eachPrefix}$property must be a mongodb id`;
      }, validationOptions)
    }
  }, validationOptions);
};
