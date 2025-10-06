import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import {
  createNewUser,
  loginUser,
  setUpApp,
  signUpNewUser,
} from './helpers/app-setup';
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
    it('Creates User', async () => {
      await signUpNewUser(app, 'admin@test.com', 'adminPassword');

      const testEmail = 'test@test.com';
      const testPassword = 'testPassword';
      const { accessToken } = await loginUser(
        app,
        'admin@test.com',
        'adminPassword',
      );
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testEmail,
          password: testPassword,
        } as CreateUserDto)
        .expect(201)
        .then((res) => {
          const { id, email, createdAt, hash, hashedRt, updatedAt } =
            res.body as SanatizeUserDto;
          expect(id).toBeDefined();
          expect(email).toEqual(testEmail);
          expect(createdAt).toBeUndefined();
          expect(updatedAt).toBeUndefined();
          expect(hash).toBeUndefined();
          expect(hashedRt).toBeUndefined();
        });
    });
    it('should throw exception on duplicate email entry', async () => {
      const user = await createNewUser(app);
      const { accessToken } = await loginUser(
        app,
        'admin@test.com',
        'adminPassword',
      );
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: user.email,
          password: 'testPassword',
        } as CreateUserDto)
        .expect(400);
    });
  });
});
