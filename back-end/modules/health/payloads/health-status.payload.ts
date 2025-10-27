import { HealthStatus } from '@/health/enums/health-status.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { ComponentStatusPayload } from './component-status.payload';

@ObjectType()
export class HealthStatusPayload {
  @Field((): [typeof ComponentStatusPayload] => {
    return [ComponentStatusPayload];
  })
  public readonly componentStatusPayloads: ComponentStatusPayload[];
  @Field((): typeof HealthStatus => {
    return HealthStatus;
  })
  public readonly healthStatus: HealthStatus;

  public constructor(componentStatusPayloads: ComponentStatusPayload[]) {
    this.componentStatusPayloads = componentStatusPayloads;

    this.healthStatus = componentStatusPayloads.reduce((serviceHealthStatus: HealthStatus, componentStatusPayload: ComponentStatusPayload): HealthStatus => {
      if (HealthStatus.down === serviceHealthStatus) {
        return serviceHealthStatus;
      }

      return componentStatusPayload.healthStatus;
    }, HealthStatus.up);
  }
};
