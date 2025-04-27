import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class TokenGeneratorService {
  abstract generate(
    purpose: string,
    userId: string,
    securityStamp: string,
  ): string;

  abstract validate(
    purpose: string,
    userId: string,
    securityStamp: string,
    token: string,
  ): boolean;
}
