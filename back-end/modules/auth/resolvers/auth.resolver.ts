import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { LocalGuard } from '@/auth/guards/local.guard';
import { AuthService } from '@/auth/services/auth.service';
import { UserEntity } from '@/user/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

@Resolver()
export class AuthResolver {
  public constructor(private readonly authService: AuthService) {
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(JwtGuard)
  public refreshToken(@SessionUser() sessionUser: UserEntity, @Context('res') response: Response): UserEntity {
    this.authService.refreshToken(sessionUser, response);

    return sessionUser;
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(LocalGuard)
  public signIn(@Args('email') _: string, @Args('password') __: string, @SessionUser() sessionUser: UserEntity, @Context('res') response: Response): UserEntity {
    this.authService.signIn(sessionUser, response);

    return sessionUser;
  }

  @Mutation((): typeof UserEntity => {
    return UserEntity;
  })
  @UseGuards(JwtGuard)
  public signOut(@SessionUser() sessionUser: UserEntity, @Context('res') response: Response): UserEntity {
    this.authService.signOut(response);

    return sessionUser;
  }
};
