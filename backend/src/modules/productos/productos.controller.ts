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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioRol } from '../usuarios/entities/usuario.entity';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { BuscarProductosDto } from './dto/buscar-productos.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { Producto } from './entities/producto.entity';
import {
  productImageMulterOptions,
  validateProductImageFiles,
} from './product-image-upload.utils';
import { ProductosService } from './productos.service';

type UploadedProductImages = {
  files?: Express.Multer.File[];
  image?: Express.Multer.File[];
};

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post('uploads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UsuarioRol.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 20 },
        { name: 'files', maxCount: 20 },
      ],
      productImageMulterOptions,
    ),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir imagenes de producto a Cloudinary' })
  @ApiCreatedResponse({
    description: 'Imagenes cargadas correctamente.',
    schema: {
      example: {
        images: [
          {
            secureUrl:
              'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-1.jpg',
            publicId: 'noir-blanc/productos/vestido-midi-1',
            width: 1200,
            height: 1600,
            format: 'jpg',
            bytes: 185432,
          },
        ],
        paths: [
          'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-1.jpg',
        ],
      },
    },
  })
  async uploadImages(
    @UploadedFiles() uploadedFiles: UploadedProductImages = {},
  ): Promise<{
    images: Awaited<ReturnType<ProductosService['uploadImages']>>;
    paths: string[];
  }> {
    const files = [
      ...(uploadedFiles.image ?? []),
      ...(uploadedFiles.files ?? []),
    ];

    if (files.length === 0) {
      throw new BadRequestException('Adjunta al menos una imagen.');
    }

    validateProductImageFiles(files);

    const images = await this.productosService.uploadImages(files);

    return {
      images,
      paths: images.map((image) => image.secureUrl),
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
