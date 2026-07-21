import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ImagenProductoColorDto } from './imagen-producto-color.dto';
import { ProductoImagenMetadataDto } from './producto-imagen-metadata.dto';
import { toBoolean, toInteger, toNumber } from './producto-dto.transforms';

export class ActualizarProductoDto {
  @ApiPropertyOptional({
    example: 'Vestido midi satinado',
    description: 'Nombre comercial del producto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Vestido elegante con acabado satinado y caida ligera.',
    description: 'Descripcion detallada del producto.',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    example: 1499.99,
    description: 'Precio de venta del producto.',
  })
  @IsOptional()
  @Transform(toNumber)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'precio debe ser un numero valido con hasta 2 decimales.' },
  )
  @Min(0)
  precio?: number;

  @ApiPropertyOptional({
    example: 12,
    description: 'Cantidad disponible en inventario.',
  })
  @IsOptional()
  @Transform(toInteger)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'existencia debe ser un numero entero.' },
  )
  @Min(0)
  existencia?: number;

  @ApiPropertyOptional({
    example: 'Vestidos',
    description: 'Categoria textual asociada al producto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @ApiPropertyOptional({
    example: ['HOMBRE', 'NUEVOS'],
    description: 'Categorias multiples asociadas al producto.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  categorias?: string[];

  @ApiPropertyOptional({
    example: 'Noir & Blanc Atelier',
    description: 'Marca textual asociada al producto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @ApiPropertyOptional({
    example: ['CH', 'M', 'G'],
    description: 'Listado de tallas disponibles.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tallas?: string[];

  @ApiPropertyOptional({
    example: ['Negro', 'Marfil'],
    description: 'Listado de colores disponibles.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  colores?: string[];

  @ApiPropertyOptional({
    example: 'https://cdn.noirblanc.local/productos/vestido-midi-cover.jpg',
    description: 'URL de la imagen principal del producto.',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  imagenPrincipal?: string | null;

  @ApiPropertyOptional({
    example: 'noir-blanc/productos/vestido-midi-cover',
    description: 'Public ID de Cloudinary para la imagen principal.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagenPrincipalPublicId?: string | null;

  @ApiPropertyOptional({
    example: 'Negro',
    description: 'Color relacionado con la imagen principal.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  imagenPrincipalColor?: string | null;

  @ApiPropertyOptional({
    example: '#f7a6c5',
    description:
      'Color visual hexadecimal relacionado con la imagen principal.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  imagenPrincipalColorHex?: string | null;

  @ApiPropertyOptional({
    example: [
      'https://cdn.noirblanc.local/productos/vestido-midi-1.jpg',
      'https://cdn.noirblanc.local/productos/vestido-midi-2.jpg',
    ],
    description: 'URLs adicionales asociadas al producto.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUrl({ require_tld: false }, { each: true })
  @MaxLength(500, { each: true })
  imagenes?: string[];

  @ApiPropertyOptional({
    description:
      'Metadata de Cloudinary para las imagenes secundarias del producto.',
    type: [ProductoImagenMetadataDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoImagenMetadataDto)
  imagenesMetadata?: ProductoImagenMetadataDto[];

  @ApiPropertyOptional({
    description: 'Relaciona cada imagen adicional con el color mostrado.',
    type: [ImagenProductoColorDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenProductoColorDto)
  imagenesPorColor?: ImagenProductoColorDto[];

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el producto esta activo para venta.',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  activo?: boolean;
}
