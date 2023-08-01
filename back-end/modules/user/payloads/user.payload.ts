import { UserEntity } from '@/user/user.entity';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

export class UserPayload {
  @IsMongoId()
  @Transform((params: TransformFnParams): any => {
    const { value } = params;

    return value.toString();
  })
  id: ObjectId;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;
  @IsInt()
  @Min(0)
  systemCount: number;
  @IsInt()
  @Min(0)
  constantSymbolCount: number;
  @IsInt()
  @Min(0)
  variableSymbolCount: number;

  constructor(user: UserEntity) {
    const { _id, firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount } = user;

    this.id = _id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.systemCount = systemCount;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
  }
};
