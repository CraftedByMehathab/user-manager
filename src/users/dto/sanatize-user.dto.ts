import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class SanatizeUserDto implements User {
  id: number;
  email: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<SanatizeUserDto>) {
    Object.assign(this, partial);
  }
}
