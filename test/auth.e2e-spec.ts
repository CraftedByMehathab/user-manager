import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setUpApp, signUpNewUser } from './helpers/app-setup';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { AuthUserDto } from 'src/auth/dto/auth-user.dto';

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
          const { id, email, accessToken } = res.body as AuthUserDto;
          expect(id).toBeDefined();
          expect(email).toEqual(testEmail);
          expect(accessToken).toBeDefined();
        });
    });
    it('should throw exception on duplicate signup', async () => {
      const user = await signUpNewUser(app);
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: user.email,
          password: 'testPassword',
        } as SignUpDto)
        .expect(400);
    });
  });
});
