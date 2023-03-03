import { IsNotEmpty } from 'class-validator';

export class UpdateFormalSystemPayload {
  @IsNotEmpty()
  public title: string = '';
  @IsNotEmpty()
  public description: string = '';
};
