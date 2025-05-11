import { Injectable } from '@nestjs/common';
import { User } from '../models/user.model';

@Injectable()
export abstract class TokenProviderService {
  abstract generate(purpose: string, user: User): string;

  abstract validate(purpose: string, user: User, token: string): boolean;
}
