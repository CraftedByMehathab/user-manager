import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { createNewUser, setUpApp } from './helpers/app-setup';
import { SanatizeUserDto } from 'src/users/dto/sanatize-user.dto';

describe('Users Controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await setUpApp();
  });
  afterAll(async () => {
    await app?.close();
  });
  describe('/ (POST) ', () => {
    it('Creates User', () => {
      const testEmail = 'test@test.com';
      const testPassword = 'testPassword';

      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: testEmail,
          password: testPassword,
        } as CreateUserDto)
        .expect(201)
        .then((res) => {
          const { id, email } = res.body as SanatizeUserDto;
          expect(id).toBeDefined();
          expect(email).toEqual(testEmail);
        });
    });
    it('should throw exception on duplicate email entry', async () => {
      const user = await createNewUser(app);
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: user.email,
          password: 'testPassword',
        } as CreateUserDto)
        .expect(400);
    });
  });
});
