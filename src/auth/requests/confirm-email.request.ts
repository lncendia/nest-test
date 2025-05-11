import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailRequest {
  @ApiProperty({
    example: '123456',
    description: 'Код подтверждения email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  code: string;
}
