import {Controller, Get, Req} from "@nestjs/common";
import {AccessControlAction} from "../../src/core/AccessControlAction";

@Controller()
export class TestingUserController {

  @Get('getUser')
  @AccessControlAction(['name', 'read'])
  public getName(
    @Req() request
  ): string {
    return request.userEntity
  }

}
