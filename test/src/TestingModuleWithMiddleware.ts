import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccessControlModule } from '../../src/core/AccessControlModule';
import * as path from 'path';
import { TestingUserService } from './TestingUserService';
import { TestingMiddleware } from './TestingMiddleware';
import { TestingUserController } from './TestingUserController';

@Module({
  imports: [
    AccessControlModule.register(
      path.join(__dirname, '..', 'config', 'model.test.conf'),
      path.join(__dirname, '..', 'config', 'policy.test.conf'),
      (params, context, accessControlService) => {
        const request = context.switchToHttp().getRequest();
        return accessControlService.hasPermission([
          request.userEntity.name,
          ...params,
        ]);
      },
    ),
  ],
  controllers: [TestingUserController],
  providers: [TestingUserService],
})
export class TestingModuleWithMiddleware implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TestingMiddleware).forRoutes('*');
  }
}
