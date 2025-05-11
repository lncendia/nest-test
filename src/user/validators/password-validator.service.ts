import { Injectable } from '@nestjs/common';

export interface PasswordValidationOptions {
  minLength: number;
  requireUppercase: boolean;
  requireSpecialChar: boolean;
  allowedSpecialChars: string;
}

@Injectable()
export class PasswordValidatorService {
  constructor(private readonly options: PasswordValidationOptions) {}

  async validate(password: string): Promise<void> {
    if (password.length < this.options.minLength) {
      throw new Error(
        `Password must be at least ${this.options.minLength} characters long.`,
      );
    }

    if (this.options.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }

    if (this.options.requireSpecialChar) {
      const specialChars = new RegExp(
        `[${this.escapeRegex(this.options.allowedSpecialChars)}]`,
      );
      if (!specialChars.test(password)) {
        throw new Error(
          `Password must contain at least one special character: ${this.options.allowedSpecialChars}`,
        );
      }
    }

    return Promise.resolve();
  }

  private escapeRegex(str: string): string {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
