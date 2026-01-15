import { UserEntity } from '@/user/entities/user.entity';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserService } from '@/user/services/user.service';
import { ValidationPipe } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

@Resolver()
export class UserResolver {
  public constructor(private readonly userService: UserService) {
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  public createUser(@Args('userPayload', new ValidationPipe({ transform: true })) payload: NewUserPayload, @Context('res') response: Response): Promise<UserEntity> {
    return this.userService.signUp(payload, response);
  }
};
