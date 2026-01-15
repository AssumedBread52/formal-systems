import { validatePayload } from '@/common/helpers/validate-payload';
import { UserEntity } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  public constructor(private readonly jwtService: JwtService) {
  }

  public generateUserToken(user: UserEntity): string {
    try {
      const validatedUser = validatePayload(user, UserEntity);

      return this.jwtService.sign({
        userId: validatedUser.id
      });
    } catch {
      throw new Error('User token generation failed');
    }
  }
};
