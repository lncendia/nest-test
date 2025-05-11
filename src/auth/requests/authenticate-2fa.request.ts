import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CodeType } from '../enums/code-type.enum ';

export class AuthenticateTwoFactorRequest {
  @ApiProperty({
    example: '123456',
    description: 'Код двухфакторной аутентификации или код восстановления',
  })
  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  code: string;

  @ApiProperty({
    enum: CodeType,
    description: 'Тип кода: authenticator, email или recoveryCode',
    example: CodeType.Authenticator,
  })
  @IsEnum(CodeType, { message: 'Недопустимый тип кода' })
  type: CodeType;
}
