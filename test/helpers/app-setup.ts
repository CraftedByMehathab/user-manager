import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { resetDb } from './prisma';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { SanatizeUserDto } from 'src/users/dto/sanatize-user.dto';
import { AuthTokensDto } from 'src/auth/dto/auth-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

export const setUpApp = async (): Promise<INestApplication<App>> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  const prisma = app.get(PrismaService);
  await resetDb(prisma);
  return app;
};

export const createNewUser = async (app: INestApplication<App>) => {
  const testEmail = 'test@test.com';
  const signupRes = await request(app.getHttpServer())
    .post('/users')
    .send({
      email: testEmail,
      password: 'testPassword',
    })
    .expect(201);
  const user = signupRes.body as SanatizeUserDto;

  // const cookie = signupRes.get('Set-Cookie') || [];
  return user;
};
export const signUpNewUser = async (
  app: INestApplication<App>,
  email: string,
  password: string,
) => {
  const signupRes = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({
      email,
      password,
    })
    .expect(201);
  const authTokens = signupRes.body as AuthTokensDto;

  // const cookie = signupRes.get('Set-Cookie') || [];
  return authTokens;
};

export const signUpAndLoginUser = async (
  app: INestApplication<App>,
  email: string,
  password: string,
) => {
  await request(app.getHttpServer())
    .post('/auth/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  const logingRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password,
    } as LoginDto)
    .expect(200);

  return logingRes.body as AuthTokensDto;
};
