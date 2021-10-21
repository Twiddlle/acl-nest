import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { AccessControlService } from './AccessControlService';
import { ModuleRef } from '@nestjs/core';
import { ValidationFunction } from './AccessControlAction';
import { AccessControlConfigParam } from './AccessControlActionTypes';

@Global()
@Module({
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {
  private accessControlService: AccessControlService;

  public constructor(private moduleRef: ModuleRef) {
    this.accessControlService = moduleRef.get(AccessControlService);
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
          return new AccessControlService(
            modelPath,
            policyPath,
            validationFunction,
          );
        },
      },
    ];
    return {
      module: AccessControlModule,
      providers,
      exports: providers,
    };
  }

  public static registerAsync(
    options: {
      inject?: Type<unknown>[];
      imports?: Type<unknown>[];
      useFactory: (...injectedDeps) => Promise<AccessControlModuleOptions> | AccessControlModuleOptions;
    }
  ): DynamicModule {
    const providers: Provider[] = [
      ...options.inject,
      {
        provide: AccessControlService,
        useFactory: async (
          ...dependenciesInjected
        ): Promise<AccessControlService> => {
          const factoryOptions = await options.useFactory(
            ...dependenciesInjected,
          );
          return new AccessControlService(
            factoryOptions.modelPath,
            factoryOptions.policyPath,
            factoryOptions.validationFunction,
          );
        },
        inject: options.inject,
      },
    ];
    return {
      imports: options.imports,
      module: AccessControlModule,
      providers,
      exports: providers,
    };
  }
}

export interface AccessControlModuleOptions {
  modelPath: AccessControlConfigParam;
  policyPath: AccessControlConfigParam;
  validationFunction?: ValidationFunction;
}
