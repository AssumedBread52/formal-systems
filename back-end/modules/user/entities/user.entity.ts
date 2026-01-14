import { Exclude } from 'class-transformer';
import { IsEmail, IsInt, IsMongoId, IsNotEmpty, Matches, Min } from 'class-validator';

export class UserEntity {
  @IsMongoId()
  public id: string = '';
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  @Exclude()
  @Matches(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
  public hashedPassword: string = '';
  @IsInt()
  @Min(0)
  public systemCount: number = 0;
  @IsInt()
  @Min(0)
  public constantSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  public variableSymbolCount: number = 0;
  @IsInt()
  @Min(0)
  public axiomCount: number = 0;
  @IsInt()
  @Min(0)
  public theoremCount: number = 0;
  @IsInt()
  @Min(0)
  public deductionCount: number = 0;
  @IsInt()
  @Min(0)
  public proofCount: number = 0;
};
