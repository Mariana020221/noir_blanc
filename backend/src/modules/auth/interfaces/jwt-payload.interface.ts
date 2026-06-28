import { UsuarioRol } from '../../usuarios/entities/usuario.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: UsuarioRol;
}
