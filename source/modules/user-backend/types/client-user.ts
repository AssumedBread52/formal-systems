import { IsNotEmpty } from 'class-validator';

export class ClientUser {
  @IsNotEmpty()
  public id: string = '';
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
}
