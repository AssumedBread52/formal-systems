import { Field, ObjectType } from '@nestjs/graphql';
import { StatusType } from '@/health/enums/status-type.enum';
import { ComponentStatusPayload } from './component-status.payload';

@ObjectType()
export class HealthStatusPayload {
  @Field((): [typeof ComponentStatusPayload] => {
    return [ComponentStatusPayload];
  })
  public readonly componentStatuses: ComponentStatusPayload[];
  @Field((): typeof StatusType => {
    return StatusType;
  })
  public readonly statusType: StatusType;

  public constructor(componentStatuses: ComponentStatusPayload[]) {
    this.componentStatuses = componentStatuses;
    this.statusType = componentStatuses.reduce((healthStatus: StatusType, componentStatus: ComponentStatusPayload): StatusType => {
      if (StatusType.down === healthStatus) {
        return healthStatus;
      }

      const { statusType } = componentStatus;

      return statusType;
    }, StatusType.up);
  }
};
