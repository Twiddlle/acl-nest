import {NestExpressApplication} from "@nestjs/platform-express";
import {NestFactory} from "@nestjs/core";
import * as request from 'supertest';
import {TestingModule} from "./src/TestingModule";
import {TestingModuleWithMiddleware} from "./src/TestingModuleWithMiddleware";

describe('app', () => {

  let app: NestExpressApplication
  let appWithMiddleware: NestExpressApplication
  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(TestingModule);
    appWithMiddleware = await NestFactory.create<NestExpressApplication>(TestingModuleWithMiddleware);
    await app.listen(3333)
    await appWithMiddleware.listen(3334)
  })

  afterAll(async () => {
    await app.close()
    await appWithMiddleware.close()
  })


  describe('universal decorator', () => {
    it('should test read user', async () => {
      const badRes = await request(app.getHttpServer())
        .get('/getName')
      expect(badRes.body.message).toBe('Forbidden resource')

      const goodRes = await request(app.getHttpServer())
        .get('/getName')
        .set('x-user', 'readuser')
      expect(goodRes.text).toBe('Bob')
    });

    it('should test write user', async () => {
      const badRes = await request(app.getHttpServer())
        .get('/writeName')
      expect(badRes.body.message).toBe('Forbidden resource')

      const goodRes = await request(app.getHttpServer())
        .get('/writeName')
        .set('x-user', 'writeuser')
      expect(goodRes.text).toBe('written')

      const badUserRes = await request(app.getHttpServer())
        .get('/writeName')
        .set('x-user', 'baduser')
      expect(badUserRes.body.message).toBe('Forbidden resource')
    });

    it('should test super user', async () => {
      const goodRes = await request(app.getHttpServer())
        .get('/getName')
        .set('x-user', 'masteruser')
      expect(goodRes.text).toBe('Bob')

      const badUserRes = await request(app.getHttpServer())
        .get('/writeName')
        .set('x-user', 'masteruser')
      expect(badUserRes.text).toBe('written')
    });

    it('should test read user for multiple object age, name', async () => {
      const goodRes = await request(app.getHttpServer())
        .get('/getNameAndAge')
        .set('x-user', 'readuser')
      expect(goodRes.text).toBe('Bob 32')
    });

    it('should test read write user for multiple object age, name', async () => {
      const goodRes = await request(app.getHttpServer())
        .get('/writeNameAndAge')
        .set('x-user', 'masteruser')
      expect(goodRes.text).toBe('Bob 32 written')

      const badRes = await request(app.getHttpServer())
        .get('/writeNameAndAge')
        .set('x-user', 'readuser')
      expect(badRes.body.message).toBe('Forbidden resource')
    });

    it('should test read user with custom functionality', async () => {
      const goodRes = await request(app.getHttpServer())
        .get('/getLastName')
        .set('x-user-name', 'masteruser')
      expect(goodRes.text).toBe('Wick')
    });

    it('should test read user with calling of service directly', async () => {
      const goodRes = await request(app.getHttpServer())
        .get('/getAge')
        .set('x-user', 'readuser')
      expect(goodRes.text).toBe('32')

      const badRes = await request(app.getHttpServer())
        .get('/getAge')
        .set('x-user', 'writeuser')
      expect(badRes.body.message).toBe('Forbidden')
    });
  })

  describe('Middleware app', ()=>{
    it('Testing permission with loaded user', async () => {
      const goodRes = await request(appWithMiddleware.getHttpServer())
        .get('/getUser')
      expect(goodRes.body.name).toBe('loadeduser')
    });

  })

})
