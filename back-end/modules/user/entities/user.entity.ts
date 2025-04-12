import { AdapterType } from '@/user/enums/adapter-type.enum';
import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, Matches, Min } from 'class-validator';

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
  @Matches(/^\$2b\$12\$.+$/)
  hashedPassword: string = '';
  @IsInt()
  @Min(0)
  systemCount: number = 0;
  @IsInt()
  @Min(0)
  constantSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  variableSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  axiomCount: number = 0;
  @IsInt()
  @Min(0)
  theoremCount: number = 0;
  @IsInt()
  @Min(0)
  deductionCount: number = 0;
  @IsInt()
  @Min(0)
  proofCount: number = 0;
};
