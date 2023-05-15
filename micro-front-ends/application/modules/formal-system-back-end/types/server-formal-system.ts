import { IsNotEmpty } from 'class-validator';

export class ServerFormalSystem {
  @IsNotEmpty()
  public title: string = '';
  @IsNotEmpty()
  public urlPath: string = '';
  @IsNotEmpty()
  public description: string = '';
  @IsNotEmpty()
  public createdByUserId: string = '';
};
