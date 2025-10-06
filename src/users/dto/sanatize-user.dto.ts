import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class SanatizeUserDto implements User {
  id: number;
  email: string;
  @Exclude()
  hash: string;
  @Exclude()
  hashedRt: string | null;
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<SanatizeUserDto>) {
    Object.assign(this, partial);
  }
}
