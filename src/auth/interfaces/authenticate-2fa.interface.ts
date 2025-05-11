import { CodeType } from '../enums/code-type.enum ';

export class AuthenticateTwoFactorData {
  userId: string;

  code: string;

  type: CodeType;
}
