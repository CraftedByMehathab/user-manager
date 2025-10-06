import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetCurrentUser = createParamDecorator(
  async (
    data: string | undefined,
    context: ExecutionContext,
  ): Promise<unknown> => {
    const user = ((await context.switchToHttp().getRequest()) satisfies Request)
      .user;

    if (!data) return user;
    return user?.[data];
  },
);
