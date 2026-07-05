import { SetMetadata } from '@nestjs/common';
import { UsuarioRol } from '../../usuarios/entities/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UsuarioRol[]) => SetMetadata(ROLES_KEY, roles);
