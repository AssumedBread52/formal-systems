import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { UserEntity } from '@/user/entities/user.entity';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserService } from '@/user/services/user.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(JwtGuard)
  public updateUser(@SessionUser() sessionUser: UserEntity, @Args('userPayload', new ValidationPipe({ transform: true })) payload: EditUserPayload): Promise<UserEntity> {
    return this.userService.editProfile(sessionUser, payload);
  }

  @Query((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(JwtGuard)
  public sessionUser(@SessionUser() sessionUser: UserEntity): UserEntity {
    return sessionUser;
  }

  @Query((): typeof UserEntity => {
    return UserEntity;
  })
  public user(@Args('userId') userId: string): Promise<UserEntity> {
    return this.userService.selectById({
      userId
    });
  }
};
