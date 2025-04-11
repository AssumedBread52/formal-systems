import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {
  }

  generateToken(userId: string): string {
    return this.jwtService.sign({
      userId
    });
  }
};
