import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequest {
  @IsString()
  @IsNotEmpty({ message: 'accessToken обязателен' })
  accessToken: string;

  @IsString()
  @IsNotEmpty({ message: 'refreshToken обязателен' })
  refreshToken: string;
}
