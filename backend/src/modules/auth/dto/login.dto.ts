import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @ApiProperty({
    example: 'admin@noirblanc.com',
    description: 'Correo electronico del administrador.',
  })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin1234!',
    description: 'Contrasena del administrador.',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
