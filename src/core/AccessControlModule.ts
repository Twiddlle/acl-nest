import {DynamicModule, Global, Module, Provider} from '@nestjs/common';
import {AccessControlService} from './AccessControlService';
import {ModuleRef} from '@nestjs/core';
import {ValidationFunction} from './AccessControlAction';
import {AccessControlConfigParam} from "./AccessControlActionTypes";

@Global()
@Module({
  providers: [
    AccessControlService
  ],
  exports: [
    AccessControlService
  ]
})

export class AccessControlModule {

  private accessControlService: AccessControlService;

  public constructor(private moduleRef: ModuleRef) {
    this.accessControlService = moduleRef.get(AccessControlService)
  }

  public static register(
    modelPath: AccessControlConfigParam,
    policyPath: AccessControlConfigParam,
    validationFunction?: ValidationFunction,
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: AccessControlService,
        useFactory: (): AccessControlService => {
          return new AccessControlService(modelPath, policyPath, validationFunction)
        }
      },
    ];
    return {
      module: AccessControlModule,
      providers,
      exports: providers,
    };
  }
}
