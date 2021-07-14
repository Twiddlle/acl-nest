import {Request} from "express";

export class TestingUserService {

  public async getUser(): Promise<{ name: string }> {
    return {
      name: 'loadeduser',
    }
  }

  public async getUserFromRequest(request: Request): Promise<string> {
    return request.headers['x-user'] as string
  }

}
