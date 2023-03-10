import { AppModule } from '@/app/app-module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AppModule]
})
export class MainModule {
};
