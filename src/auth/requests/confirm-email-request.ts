import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailRequest {
  @IsString()
  @IsNotEmpty({ message: 'Код обязателен' })
  code: string;
}
