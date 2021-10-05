import {
  applyDecorators,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AccessControlGuard } from './AccessControlGuard';
import { AccessControlService } from './AccessControlService';

export type ValidationFunction = (
  params: (string | string[])[],
  context: ExecutionContext,
  accessControlService: AccessControlService,
  ...any
) => Promise<boolean> | boolean;

export const AccessControlAction = (
  params: (string | string[])[],
  processCustomValidation?: ValidationFunction,
): PropertyDecorator => {
  return applyDecorators(
    SetMetadata(AccessControlAction.name, params),
    SetMetadata(AccessControlAction.name + 'Fn', processCustomValidation),
    UseGuards(AccessControlGuard),
  );
};
