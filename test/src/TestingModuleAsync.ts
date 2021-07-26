import {Module} from "@nestjs/common";
import {AccessControlModule} from "../../src/core/AccessControlModule";
import * as path from "path";
import {TestingController} from "./TestingController";
import {TestingUserService} from "./TestingUserService";

@Module({
  imports: [
    AccessControlModule.registerAsync({
      inject: [TestingUserService],
      useFactory: (testingUserService: TestingUserService) => {
        return {
          modelPath: path.join(__dirname, '..', 'config', 'model.test.conf'),
          policyPath: path.join(__dirname, '..', 'config', 'policy.test.conf'),
          validationFunction: async (params, context, accessControlService) => {
            const request = context.switchToHttp().getRequest();
            const userName = await testingUserService.getUserFromRequest(request)
            return accessControlService.hasPermission([userName, ...params])
          },
        }
      }
    })
  ],
  controllers: [TestingController]
})
export class TestingModuleAsync {
}
