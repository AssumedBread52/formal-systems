import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ComponentStatusPayload {
  @Field((): typeof ComponentType => {
    return ComponentType;
  })
  public readonly componentType: ComponentType;
  @Field((): typeof HealthStatus => {
    return HealthStatus;
  })
  public readonly healthStatus: HealthStatus;

  public constructor(componentType: ComponentType, healthStatus: HealthStatus) {
    this.componentType = componentType;
    this.healthStatus = healthStatus;
  }
};
