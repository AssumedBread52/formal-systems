import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { NewFormalSystemPayload } from './data-transfer-objects';
import { SessionUserId } from './decorators';
import { FormalSystemService } from './formal-system.service';
import { JwtGuard } from './guards';

@Controller('formal-system')
export class FormalSystemController {
  constructor(private formalSystemService: FormalSystemService) {
  }

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  createFormalSystem(@SessionUserId() sessionUserId: string, @Body(new ValidationPipe()) newFormalSystemPayload: NewFormalSystemPayload): void {
    const { title, description } = newFormalSystemPayload;

    this.formalSystemService.create({
      title,
      urlPath: encodeURIComponent(title),
      description,
      createdByUserId: sessionUserId
    });
  }
};
