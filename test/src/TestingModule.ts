import {Module} from "@nestjs/common";
import {AccessControlModule} from "../../src/core/AccessControlModule";
import * as path from "path";
import {TestingController} from "./TestingController";

@Module({
  imports: [
    AccessControlModule.register(
      path.join(__dirname, '..', 'config', 'model.test.conf'),
      path.join(__dirname, '..', 'config', 'policy.test.conf'),
      (params, context, accessControlService)=>{
        const request = context.switchToHttp().getRequest();
        request.user = request.headers['x-user']
        return accessControlService.hasPermission([request.user, ...params])
      }
    )
  ],
  controllers: [TestingController]
})
export class TestingModule{}
