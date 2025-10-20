import { ComponentType } from '@/health/enums/component-type.enum';
import { StatusType } from '@/health/enums/status-type.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ComponentStatusPayload {
  @Field((): typeof ComponentType => {
    return ComponentType;
  })
  public readonly componentType: ComponentType;
  @Field((): typeof StatusType => {
    return StatusType;
  })
  public readonly statusType: StatusType;

  public constructor(componentType: ComponentType, statusType: StatusType) {
    this.componentType = componentType;
    this.statusType = statusType;
  }
};
