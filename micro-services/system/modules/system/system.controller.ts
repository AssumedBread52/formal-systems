import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { NewSystemPayload } from './data-transfer-objects';
import { SessionUserId } from './decorators';
import { SystemService } from './system.service';
import { JwtGuard } from './guards';

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {
  }

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  createSystem(@SessionUserId() sessionUserId: string, @Body(new ValidationPipe()) newSystemPayload: NewSystemPayload): void {
    const { title, description } = newSystemPayload;

    this.systemService.create({
      title,
      urlPath: encodeURIComponent(title),
      description,
      createdByUserId: sessionUserId
    });
  }
};
