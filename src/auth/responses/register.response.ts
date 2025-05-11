import { AuthenticateResponse } from './authenticate.response';

export interface RegisterResponse extends AuthenticateResponse {
  emailCode: string;
}
