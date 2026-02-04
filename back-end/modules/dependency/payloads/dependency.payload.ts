import { DependencyType } from '@/dependency/enums/dependency-type.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DependencyPayload {
  @Field((): typeof String => {
    return String;
  })
  public readonly name: string;
  @Field((): typeof String => {
    return String;
  })
  public readonly version: string;
  @Field((): typeof DependencyType => {
    return DependencyType;
  })
  public readonly type: DependencyType;

  public constructor(name: string, version: string, type: DependencyType) {
    this.name = name;
    this.version = version;
    this.type = type;
  }
};
