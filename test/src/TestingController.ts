import { Controller, Get, Req } from '@nestjs/common';
import { AccessControlAction } from '../../src/core/AccessControlAction';
import { AccessControlService } from '../../src/core/AccessControlService';
import { Request } from 'express';

@Controller()
export class TestingController {
  public constructor(
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('getName')
  @AccessControlAction(['name', 'read'])
  public getName(): string {
    return 'Bob';
  }

  @Get('writeName')
  @AccessControlAction(['name', 'write'])
  public writeName(): string {
    return 'written';
  }

  @Get('getLastName')
  @AccessControlAction(
    ['name', 'read'],
    (params, context, accessControlService) => {
      const request = context.switchToHttp().getRequest();
      return accessControlService.hasPermission([
        request.headers['x-user-name'],
        ...params,
      ]);
    },
  )
  public getLastName(): string {
    return 'Wick';
  }

  @Get('getNameAndAge')
  @AccessControlAction([['name', 'age'], 'read'])
  public getNameAndAge(): string {
    return 'Bob 32';
  }

  @Get('writeNameAndAge')
  @AccessControlAction([
    ['name', 'age'],
    ['read', 'write'],
  ])
  public writeNameAndAge(): string {
    return 'Bob 32 written';
  }

  @Get('getAge')
  public async getAge(@Req() request: Request): Promise<number> {
    await this.accessControlService.checkPermission([
      request.headers['x-user'] as string,
      'age',
      'read',
    ]);
    return 32;
  }
}
