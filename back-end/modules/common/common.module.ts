import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';

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
    }
  ]
})
export class CommonModule {
};
