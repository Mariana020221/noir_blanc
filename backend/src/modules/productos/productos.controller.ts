import {
  BadRequestException,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { BuscarProductosDto } from './dto/buscar-productos.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { Producto } from './entities/producto.entity';
import { ProductosService } from './productos.service';

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const maxProductImageSizeInBytes = 5 * 1024 * 1024;

const isSafeExtension = (value: string) => /^[.a-z0-9]+$/.test(value);

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post('uploads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const safeExtension = isSafeExtension(extension) ? extension : '';

          callback(
            null,
            `producto-${Date.now()}-${randomUUID()}${safeExtension}`,
          );
        },
      }),
      fileFilter: (_request, file, callback) => {
        if (!allowedImageMimeTypes.has(file.mimetype)) {
          callback(
            new BadRequestException(
              'Solo se permiten imagenes JPG, PNG, WEBP, AVIF o GIF.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: maxProductImageSizeInBytes,
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir imagenes de producto' })
  @ApiCreatedResponse({
    description: 'Imagenes cargadas correctamente.',
    schema: {
      example: {
        paths: ['/uploads/producto-12345-demo.jpg'],
      },
    },
  })
  uploadImages(
    @UploadedFiles() files: Array<{ filename: string }> = [],
  ): { paths: string[] } {
    if (files.length === 0) {
      throw new BadRequestException('Adjunta al menos una imagen.');
    }

    return {
      paths: this.productosService.buildImagePaths(files),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
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
