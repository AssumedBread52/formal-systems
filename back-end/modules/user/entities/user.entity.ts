import { AdapterType } from '@/user/enums/adapter-type.enum';
import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsPositive, Matches } from 'class-validator';

export class UserEntity {
  @Exclude()
  @IsEnum(AdapterType)
  type: AdapterType = AdapterType.Mongo;
  @IsNotEmpty()
  id: string = '';
  @IsNotEmpty()
  firstName: string = '';
  @IsNotEmpty()
  lastName: string = '';
  @IsEmail()
  email: string = '';
  @Exclude()
  @Matches(/\$2b\$12\$.+/)
  hashedPassword: string = '';
  @IsInt()
  @IsPositive()
  systemCount: number = 0;
  @IsInt()
  @IsPositive()
  constantSymbolCount: number = 0;
  @IsInt()
  @IsPositive()
  variableSymbolCount: number = 0;
  @IsInt()
  @IsPositive()
  axiomCount: number = 0;
  @IsInt()
  @IsPositive()
  theoremCount: number = 0;
  @IsInt()
  @IsPositive()
  deductionCount: number = 0;
  @IsInt()
  @IsPositive()
  proofCount: number = 0;
};
