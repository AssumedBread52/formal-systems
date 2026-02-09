import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { UserEntity } from '@/user/entities/user.entity';
import { EditUserPayload } from '@/user/payloads/edit-user.payload';
import { NewUserPayload } from '@/user/payloads/new-user.payload';
import { UserReadService } from '@/user/services/user-read.service';
import { UserWriteService } from '@/user/services/user-write.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

@Resolver()
export class UserResolver {
  public constructor(private readonly userReadService: UserReadService, private readonly userWriteService: UserWriteService) {
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  public createUser(@Args('userPayload', new ValidationPipe({ transform: true })) payload: NewUserPayload, @Context('res') response: Response): Promise<UserEntity> {
    return this.userWriteService.signUp(payload, response);
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(JwtGuard)
  public updateUser(@SessionUser() sessionUser: UserEntity, @Args('userPayload', new ValidationPipe({ transform: true })) payload: EditUserPayload): Promise<UserEntity> {
    return this.userWriteService.editProfile(sessionUser, payload);
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
    return this.userReadService.selectById(userId);
  }
};
