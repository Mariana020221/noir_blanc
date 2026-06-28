import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearUsuarioDto {
  @ApiProperty({
    example: 'Administrador Noir & Blanc',
    description: 'Nombre del usuario administrador.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  nombre: string;

  @ApiProperty({
    example: 'admin@noirblanc.com',
    description: 'Correo electronico unico del administrador.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({
    example: 'Admin1234!',
    description: 'Contrasena del administrador.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
