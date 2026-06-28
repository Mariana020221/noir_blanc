import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@noirblanc.com',
    description: 'Correo electronico del administrador.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
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
