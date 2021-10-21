import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { newEnforcer, Model, StringAdapter } from 'casbin';
import { ValidationFunction } from './AccessControlAction';
import { AccessControlConfigParam } from './AccessControlActionTypes';
import { readFileSync } from 'fs';

@Injectable()
export class AccessControlService implements OnModuleInit {
  private enforcer;

  public constructor(
    private readonly modelPath: AccessControlConfigParam,
    private readonly policyPath: AccessControlConfigParam,
    public readonly validationFunction?: ValidationFunction,
  ) {}

  public async onModuleInit(): Promise<void> {
    const model = new Model();
    let policy: string;
    if (typeof this.modelPath === 'string') {
      model.loadModel(this.modelPath);
    } else {
      model.loadModelFromText(await this.modelPath());
    }

    if (typeof this.policyPath === 'string') {
      policy = readFileSync(this.policyPath).toString();
    } else {
      policy = await this.policyPath();
    }

    this.enforcer = await newEnforcer(model, new StringAdapter(policy));
  }

  public async checkPermission(params: (string | string[])[]): Promise<void> {
    if (await this.hasPermission(params)) {
      return;
    }
    throw new ForbiddenException();
  }

  public async hasPermission(params: (string | string[])[]): Promise<boolean> {
    const multiParamsSet = [];
    for (const paramIndex in params) {
      const param = params[paramIndex];
      if (param instanceof Array) {
        for (const multiParamItem of param) {
          const singleParams = [...params];
          singleParams[paramIndex] = multiParamItem;
          multiParamsSet.push(singleParams);
        }
      }
    }
    if (multiParamsSet.length === 0) {
      multiParamsSet.push(params);
    }
    for (const multiParamsSetItems of multiParamsSet) {
      if (!(await this.enforcer.enforce(...multiParamsSetItems))) {
        return false;
      }
    }
    return true;
  }
}
