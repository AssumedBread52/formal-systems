import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';

@Module({
  providers: [
    {
      inject: [
        Reflector
      ],
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector): ClassSerializerInterceptor => {
        return new ClassSerializerInterceptor(reflector, {
          excludePrefixes: [
            '__'
          ]
        });
      }
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true
      })
    }
  ]
})
export class CommonModule {
};
