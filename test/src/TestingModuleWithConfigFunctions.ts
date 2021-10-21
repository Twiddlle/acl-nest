import { Module } from '@nestjs/common';
import { AccessControlModule } from '../../src/core/AccessControlModule';
import * as path from 'path';
import { TestingController } from './TestingController';
import { readFileSync } from 'fs';

@Module({
  imports: [
    AccessControlModule.register(
      () =>
        readFileSync(
          path.join(__dirname, '..', 'config', 'model.test.conf'),
        ).toString(),
      () =>
        readFileSync(
          path.join(__dirname, '..', 'config', 'policy.test.conf'),
        ).toString(),
      (params, context, accessControlService) => {
        const request = context.switchToHttp().getRequest();
        request.user = request.headers['x-user'];
        return accessControlService.hasPermission([request.user, ...params]);
      },
    ),
  ],
  controllers: [TestingController],
})
export class TestingModuleWithConfigFunctions {}
