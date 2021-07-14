# ACL Nest

ACL nestjs module functionality using casbin package

Install package
```bash
npm i acl-nest --save
```

## Usage

### Module registration
First register AccessControlModule into your App/Root module.
```typescript
import {Module} from "@nestjs/common";
import {AccessControlModule} from "@acl-nest/AccessControlModule";
import * as path from "path";

@Module({
  imports: [
    AccessControlModule.register(
      'path to your model config or function wich returns model as text',
      'path to your policy config or function wich returns policy as text',
      (params, context, accessControlService)=>{
        const request = context.switchToHttp().getRequest();
        request.user = request.headers['x-user'] // here you can do any custom logic
        return accessControlService.hasPermission([request.user, ...params])
      }
    )
  ],
  controllers: [YourController]
})
export class CustomTestingModule{}
```
Note: Example of casbin configurations can be found [here](https://casbin.org/docs/en/supported-models)

### Adding controller
Decorate you controller methods
```typescript
@Controller()
export class YourController {
  @Get('getName')
  @AccessControlAction(['name', 'read']) // this params are based on you model
  public getName(): string {
    return 'Bob'
  }
}
```

### Custom validation function
You can specify and override you validation logic if you need it. 
Just specify function for validation same as it is in register module action.
```typescript
@Controller()
export class YourController {
    @Get('getLastName')
    @AccessControlAction(['name', 'read'], (params, context, accessControlService) => {
      const request = context.switchToHttp().getRequest();
      return accessControlService.hasPermission([request.headers['x-user-name'], ...params])
    })
    public getLastName(): string {
      return 'Wick'
    }
}
```

### Direct call of AccessControlService logic
Sometimes you need to check permission in deep context of your application. 
In this case you can use AccessControlService directly. Just inject AccessControlService.
```typescript
@Controller()
export class YourController {

    public constructor(
      private readonly accessControlService: AccessControlService
    ) {
    }

    @Get('getAge')
    public async getAge(
      @Req() request: Request
    ): Promise<number> {
      // we need to call checkPermission instead of hasPermission
      // because check permission will throw same Error as Guard used in decorators, instead or returning boolean
      await this.accessControlService.checkPermission([request.headers['x-user'], 'age', 'read'])
      return 32;
    }
}
```

## Advanced usage

### More complex logic before handling permissions
Sometime is necessary to load some user data, or handle some request to auth user before checking permissions.
But registered validation function has available only ExecutionContext 
which cannot help us to get some other service to load user for example.
Good approach here is to use middlewares, which are executed before Guards or register module asynchronously.

#### 1. Register Module asynchronous with injected dependencies
```typescript
@Module({
  imports: [
    AccessControlModule.registerAsync({
      inject: [UserService], // you can inject anything here
      useFactory: (userService: UserService) => {
        return {
          modelPath: path.join(__dirname, '..', 'config', 'model.test.conf'),
          policyPath: path.join(__dirname, '..', 'config', 'policy.test.conf'),
          validationFunction: async (params, context, accessControlService) => {
            const request = context.switchToHttp().getRequest();
            const userName = await userService.getUserFromRequest(request) // you can use injected service
            return accessControlService.hasPermission([userName, ...params])
          },
        }
      }
    })
  ],
})
export class TestingModuleAsync {
}
```

#### 2. Middleware usage

##### First create middleware
```typescript
@Injectable()
export class UserMiddleware implements NestMiddleware {

  constructor(
    private readonly userService: UserService
  ) {}

  public async use(req: any, res: any, next: () => void): Promise<any> {
    req.userEntity = await this.userService.loadUser()
    next()
  }

}
```

##### Register middleware and write your validation function
```typescript
@Module({
  imports: [
    AccessControlModule.register(
      'path to your model config or function wich returns model as text',
      'path to your policy config or function wich returns policy as text',
      (params, context, accessControlService) => {
        const request = context.switchToHttp().getRequest();
        return accessControlService.hasPermission([request.userEntity.name, ...params])
      }
    )
  ],
  providers: [UserService],
})
export class YourModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(UserMiddleware)
      .forRoutes('*')
  }
}
```

### Multiple parameters
You can even specify multiple params like objects, actions from model.
```typescript
@Controller()
export class YourController {

  @Get('getNameAndAge')
  @AccessControlAction([['name', 'age'], 'read'])
  public getNameAndAge(): string {
    return 'Bob 32'
  }

  @Get('writeNameAndAge')
  @AccessControlAction([['name', 'age'], ['read', 'write']])
  public writeNameAndAge(): string {
    return 'Bob 32 written'
  }
}
```
In this case all combinations of specified params will be checked. 
The reason why this functionality was created 
is to have option check all permissions without specifying unnecessary aliases for other model properties.
