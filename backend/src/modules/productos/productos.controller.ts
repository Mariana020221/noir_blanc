import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { BuscarProductosDto } from './dto/buscar-productos.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { Producto } from './entities/producto.entity';
import { ProductosService } from './productos.service';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({
    description: 'Producto creado correctamente.',
    type: Producto,
  })
  create(@Body() createProductoDto: CrearProductoDto): Promise<Producto> {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con filtros opcionales' })
  @ApiOkResponse({
    description: 'Listado de productos.',
    type: Producto,
    isArray: true,
  })
  findAll(@Query() filters: BuscarProductosDto): Promise<Producto[]> {
    return this.productosService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por id' })
  @ApiOkResponse({
    description: 'Producto encontrado.',
    type: Producto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiOkResponse({
    description: 'Producto actualizado correctamente.',
    type: Producto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarProductoDto: ActualizarProductoDto,
  ): Promise<Producto> {
    return this.productosService.update(id, actualizarProductoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar logicamente un producto' })
  @ApiNoContentResponse({
    description: 'Producto eliminado correctamente.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productosService.remove(id);
  }
}
