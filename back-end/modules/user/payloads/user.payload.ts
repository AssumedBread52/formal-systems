import { UserEntity } from '@/user/user.entity';
import { IsEmail, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class UserPayload {
  @IsMongoId()
  id: string;
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
  @IsInt()
  @Min(0)
  axiomCount: number;
  @IsInt()
  @Min(0)
  theoremCount: number;
  @IsInt()
  @Min(0)
  deductionCount: number;

  constructor(user: UserEntity) {
    const { _id, firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount } = user;

    this.id = _id.toString();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.systemCount = systemCount;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
    this.axiomCount = axiomCount;
    this.theoremCount = theoremCount;
    this.deductionCount = deductionCount;
  }
};
