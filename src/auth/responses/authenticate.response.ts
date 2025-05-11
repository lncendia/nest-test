export interface AuthenticateResponse {
  accessToken: string;
  refreshToken: string | null;
  refreshTokenValidity: number | null;
  twoFactorRequired: boolean;
}
