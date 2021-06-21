export class TestingUserService {

  public async getUser(): Promise<{ name: string }> {
    return {
      name: 'loadeduser',

    }
  }

}
