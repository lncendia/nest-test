import { AuthenticateResponse } from './authenticate.responce';

export interface RegisterResponse extends AuthenticateResponse {
  emailCode: string;
}
