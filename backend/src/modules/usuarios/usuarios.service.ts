import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuario, UsuarioRol } from './entities/usuario.entity';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async createBootstrapAdmin(
    crearUsuarioDto: CrearUsuarioDto,
  ): Promise<Usuario> {
    const canBootstrap = await this.canBootstrap();

    if (!canBootstrap) {
      throw new ForbiddenException(
        'El usuario inicial ya fue creado. Inicia sesion para administrar mas usuarios.',
      );
    }

    return this.createUser(crearUsuarioDto, UsuarioRol.SUPER_ADMIN);
  }

  async createAdmin(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    return this.createUser(crearUsuarioDto, UsuarioRol.ADMIN);
  }

  async registerAdmin(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    const canBootstrap = await this.canBootstrap();

    if (canBootstrap) {
      throw new ForbiddenException(
        'Primero crea el superusuario inicial antes de registrar mas usuarios.',
      );
    }

    return this.createUser(crearUsuarioDto, UsuarioRol.ADMIN);
  }

  private async createUser(
    crearUsuarioDto: CrearUsuarioDto,
    rol: UsuarioRol,
  ): Promise<Usuario> {
    const email = crearUsuarioDto.email.trim().toLowerCase();
    const existente = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .withDeleted()
      .where('usuario.email = :email', { email })
      .getOne();

    if (existente) {
      throw new ConflictException(`Ya existe un usuario con email ${email}.`);
    }

    const passwordHash = await bcrypt.hash(
      crearUsuarioDto.password,
      PASSWORD_SALT_ROUNDS,
    );

    const usuario = this.usuariosRepository.create({
      nombre: crearUsuarioDto.nombre.trim(),
      email,
      password: passwordHash,
      rol,
      activo: true,
    });

    const usuarioGuardado = await this.usuariosRepository.save(usuario);
    const usuarioCreado = await this.findById(usuarioGuardado.id);

    if (!usuarioCreado) {
      throw new InternalServerErrorException(
        'No fue posible recuperar el usuario creado.',
      );
    }

    return usuarioCreado;
  }

  async canBootstrap(): Promise<boolean> {
    const usuariosActivos = await this.usuariosRepository.count();

    return usuariosActivos === 0;
  }

  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<Usuario | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (includePassword) {
      return this.usuariosRepository
        .createQueryBuilder('usuario')
        .addSelect('usuario.password')
        .where('usuario.email = :email', { email: normalizedEmail })
        .andWhere('usuario.deletedAt IS NULL')
        .getOne();
    }

    return this.usuariosRepository.findOne({
      where: { email: normalizedEmail },
    });
  }

  findById(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { id },
    });
  }
}
