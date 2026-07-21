import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CambiarPasswordUsuarioDto {
  @ApiProperty({
    example: 'NuevaClave123!',
    description: 'Nueva contrasena del usuario del panel.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
