import { Injectable, NestMiddleware } from '@nestjs/common';
import { TestingUserService } from './TestingUserService';

@Injectable()
export class TestingMiddleware implements NestMiddleware {
  constructor(private readonly testingUserService: TestingUserService) {}

  public async use(req: any, res: any, next: () => void): Promise<any> {
    req.userEntity = await this.testingUserService.getUser();
    next();
  }
}
