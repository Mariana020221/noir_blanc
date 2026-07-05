import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BootstrapStatusDto } from './dto/bootstrap-status.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuario, UsuarioRol } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un usuario del panel autenticado por superusuario',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente.',
    type: Usuario,
  })
  create(@Body() crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    return this.usuariosService.createAdmin(crearUsuarioDto);
  }

  @Post('register')
  @ApiOperation({
    summary:
      'Registrar un usuario adicional del panel cuando el superusuario inicial ya existe',
  })
  @ApiCreatedResponse({
    description: 'Usuario del panel creado correctamente.',
    type: Usuario,
  })
  register(@Body() crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    return this.usuariosService.registerAdmin(crearUsuarioDto);
  }

  @Post('bootstrap')
  @ApiOperation({
    summary:
      'Crear el primer superusuario cuando el sistema aun no tiene usuarios',
  })
  @ApiCreatedResponse({
    description: 'Primer superusuario creado correctamente.',
    type: Usuario,
  })
  createBootstrapAdmin(
    @Body() crearUsuarioDto: CrearUsuarioDto,
  ): Promise<Usuario> {
    return this.usuariosService.createBootstrapAdmin(crearUsuarioDto);
  }

  @Get('bootstrap-status')
  @ApiOperation({
    summary: 'Consultar si el sistema permite crear el primer administrador',
  })
  @ApiOkResponse({
    description: 'Estado de bootstrap del modulo de usuarios.',
    type: BootstrapStatusDto,
  })
  async getBootstrapStatus(): Promise<BootstrapStatusDto> {
    return {
      canCreateFirstAdmin: await this.usuariosService.canBootstrap(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios del panel para el superusuario' })
  @ApiOkResponse({
    description: 'Listado de usuarios.',
    type: Usuario,
    isArray: true,
  })
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }
}
