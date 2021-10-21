import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AccessControlService } from './AccessControlService';
import { Reflector } from '@nestjs/core';
import { AccessControlAction, ValidationFunction } from './AccessControlAction';

@Injectable()
export class AccessControlGuard implements CanActivate {
  public constructor(
    private readonly accessControlService: AccessControlService,
    private reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const params = this.reflector.get<string[]>(
      AccessControlAction.name,
      context.getHandler(),
    );
    const customValidationFunction = this.reflector.get<ValidationFunction>(
      AccessControlAction.name + 'Fn',
      context.getHandler(),
    );

    if (
      !customValidationFunction &&
      !this.accessControlService.validationFunction
    ) {
      throw new Error('Validation function is not defined.');
    }

    if (customValidationFunction) {
      return customValidationFunction(
        params,
        context,
        this.accessControlService,
      );
    }
    return this.accessControlService.validationFunction(
      params,
      context,
      this.accessControlService,
    );
  }
}
