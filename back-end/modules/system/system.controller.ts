import { SessionUserId } from '@/auth/decorators/session-user-id';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { NewSystemPayload } from './data-transfer-objects/new-system.payload';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  postSystem(@SessionUserId() sessionUserId: ObjectId, @Body(ValidationPipe) newSystemPayload: NewSystemPayload): void {
    this.systemService.create(newSystemPayload, sessionUserId);
  }
};
