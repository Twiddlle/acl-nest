import {ForbiddenException, Injectable, OnModuleInit} from '@nestjs/common';
import {newEnforcer} from 'casbin';
import {ValidationFunction} from './AccessControlAction';

@Injectable()
export class AccessControlService implements OnModuleInit {

  private enforcer;

  public constructor(
    private readonly modelPath: string,
    private readonly policyPath: string,
    public readonly validationFunction?: ValidationFunction,
  ) {
  }

  public async onModuleInit(): Promise<void> {
    this.enforcer = await newEnforcer(this.modelPath, this.policyPath)
  }

  public async checkPermission(params: (string | string[])[]): Promise<void> {
    if (await this.hasPermission(params)) {
      return
    }
    throw new ForbiddenException()
  }

  public async hasPermission(
    params: (string | string[])[]
  ): Promise<boolean> {
    const multiParamsSet = []
    for (const paramIndex in params) {
      const param = params[paramIndex]
      if (param instanceof Array) {
        for (const multiParamItem of param) {
          const singleParams = [...params]
          singleParams[paramIndex] = multiParamItem
          multiParamsSet.push(singleParams)
        }
      }
    }
    if (multiParamsSet.length === 0) {
      multiParamsSet.push(params)
    }
    for (const multiParamsSetItems of multiParamsSet) {
      if (!(await this.enforcer.enforce(...multiParamsSetItems))) {
        return false;
      }
    }
    return true;
  }


}
