import { AppModule } from '@/app/app.module';
import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AppModule,
    AuthModule
  ]
})
export class MainModule {
};
