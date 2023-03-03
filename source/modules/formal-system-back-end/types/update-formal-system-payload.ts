import { IsNotEmpty } from 'class-validator';

export class UpdateFormalSystemPayload {
  @IsNotEmpty()
  public id: string = '';
  @IsNotEmpty()
  public title: string = '';
  @IsNotEmpty()
  public description: string = '';
};
