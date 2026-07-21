import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const usuario = await this.usuariosService.findByEmail(email, true);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordValida = await this.validarPassword(
      password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const accessToken = await this.generarTokenJWT(usuario);
    const usuarioPublico = await this.usuariosService.findById(usuario.id);

    if (!usuarioPublico) {
      throw new UnauthorizedException('No fue posible cargar el usuario.');
    }

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('jwt.expiresIn') ?? '1d',
      usuario: usuarioPublico,
    };
  }

  async validarPassword(
    passwordPlano: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(passwordPlano, passwordHash);
  }

  async generarTokenJWT(usuario: Usuario): Promise<string> {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return this.jwtService.signAsync(payload);
  }
}
