import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import {
  setUpApp,
  signUpAndLoginUser,
  signUpNewUser,
} from './helpers/app-setup';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { AuthTokensDto } from 'src/auth/dto/auth-user.dto';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await setUpApp();
  });
  afterAll(async () => {
    await app?.close();
  });
  describe('/signup (POST) ', () => {
    it('Creates User', () => {
      const testEmail = 'test@test.com';
      const testPassword = 'testPassword';

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
        } as SignUpDto)
        .expect(201)
        .then((res) => {
          const { refreshToken, accessToken } = res.body as AuthTokensDto;
          expect(refreshToken).toBeDefined();
          expect(accessToken).toBeDefined();
        });
    });
    it('should throw exception on duplicate signup', async () => {
      const testEmail = 'testEmail1@IsEmail.com';
      const testPassword = 'testPassword';
      await signUpNewUser(app, testEmail, testPassword);
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testEmail,
          password: testPassword,
        } as SignUpDto)
        .expect(400);
    });
  });
  describe('/login (POST)', () => {
    it('should login with right credentials', async () => {
      const testEmail = 'test1@test1.com';
      const testPassword = 'testPassword';
      await signUpNewUser(app, testEmail, testPassword);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        } as SignUpDto)
        .expect(200);
    });
    it('should fail with incorrect credentials', async () => {
      const testEmail = 'test1@test1.com';
      const testPassword = 'testPassword';

      await signUpNewUser(app, testEmail, testPassword);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'incorrect',
        } as SignUpDto)
        .expect(403);
    });
  });
  describe('/logout (PATCH)', () => {
    it('should logout with right accessToken', async () => {
      const testEmail = 'test1@test1.com';
      const testPassword = 'testPassword';
      const { accessToken } = await signUpAndLoginUser(
        app,
        testEmail,
        testPassword,
      );
      return request(app.getHttpServer())
        .patch('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
    it('should fail with no access token', async () => {
      return request(app.getHttpServer()).patch('/auth/logout').expect(401);
    });
  });
  describe('/refresh (PATCH)', () => {
    it('should refresh tokens with right refreshToken', async () => {
      const testEmail = 'test1@test1.com';
      const testPassword = 'testPassword';
      const { refreshToken } = await signUpAndLoginUser(
        app,
        testEmail,
        testPassword,
      );
      return request(app.getHttpServer())
        .patch('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .then((res) => {
          const { accessToken, refreshToken } = res.body as AuthTokensDto;
          expect(accessToken).toBeDefined();
          expect(refreshToken).toBeDefined();
        });
    });
    it('should fail with no access token', async () => {
      return request(app.getHttpServer()).patch('/auth/refresh').expect(401);
    });
  });
});
