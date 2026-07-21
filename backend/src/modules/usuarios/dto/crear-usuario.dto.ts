import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const normalizeText = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CrearUsuarioDto {
  @ApiProperty({
    example: 'Administrador Noir & Blanc',
    description: 'Nombre del usuario administrador.',
  })
  @Transform(normalizeText)
  @IsString()
  @MaxLength(120)
  nombre: string;

  @ApiProperty({
    example: 'admin@noirblanc.com',
    description: 'Correo electronico unico del administrador.',
  })
  @Transform(normalizeEmail)
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
