import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {
  }

  generateToken(userId: ObjectId): string {
    return this.jwtService.sign({
      id: userId
    });
  }
};
