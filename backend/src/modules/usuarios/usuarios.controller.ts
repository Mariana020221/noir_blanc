import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BootstrapStatusDto } from './dto/bootstrap-status.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un usuario administrador autenticado',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente.',
    type: Usuario,
  })
  create(@Body() crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    return this.usuariosService.createAdmin(crearUsuarioDto);
  }

  @Post('bootstrap')
  @ApiOperation({
    summary:
      'Crear el primer usuario administrador cuando el sistema aun no tiene usuarios',
  })
  @ApiCreatedResponse({
    description: 'Primer usuario administrador creado correctamente.',
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios administradores' })
  @ApiOkResponse({
    description: 'Listado de usuarios.',
    type: Usuario,
    isArray: true,
  })
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }
}
