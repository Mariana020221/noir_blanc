import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiadmin@noirblanc.comIiwicm9sIjoiQURNSU4ifQ.example',
    description: 'Token JWT para autenticacion Bearer.',
  })
  accessToken: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo de token devuelto por la API.',
  })
  tokenType: string;

  @ApiProperty({
    example: '1d',
    description: 'Tiempo de expiracion configurado para el JWT.',
  })
  expiresIn: string;

  @ApiProperty({
    type: () => Usuario,
    description: 'Datos del usuario autenticado.',
  })
  usuario: Usuario;
}
