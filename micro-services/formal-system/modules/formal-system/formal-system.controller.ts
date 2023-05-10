import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
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
  createFormalSystem(@SessionUserId() sessionUserId: string, @Body(new ValidationPipe()) newFormalSystemPayload: NewFormalSystemPayload) {
    const { title, description } = newFormalSystemPayload;

    this.formalSystemService.create({
      title,
      urlPath: this.formalSystemService.buildUrlPath(title),
      description,
      createdByUserId: sessionUserId
    });
  }
};
