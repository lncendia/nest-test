import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorRequest {
  @ApiProperty({
    example: '123456',
    description: 'Код двухфакторной аутентификации',
  })
  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  code: string;
}
