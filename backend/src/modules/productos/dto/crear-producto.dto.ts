import { Transform } from 'class-transformer';
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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toBoolean, toInteger, toNumber } from './producto-dto.transforms';

export class CrearProductoDto {
  @ApiProperty({
    example: 'Vestido midi satinado',
    description: 'Nombre comercial del producto.',
  })
  @IsString()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({
    example: 'Vestido elegante con acabado satinado y caida ligera.',
    description: 'Descripcion detallada del producto.',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    example: 1499.99,
    description: 'Precio de venta del producto.',
  })
  @Transform(toNumber)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'precio debe ser un numero valido con hasta 2 decimales.' },
  )
  @Min(0)
  precio: number;

  @ApiProperty({
    example: 12,
    description: 'Cantidad disponible en inventario.',
  })
  @Transform(toInteger)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'existencia debe ser un numero entero.' },
  )
  @Min(0)
  existencia: number;

  @ApiProperty({
    example: 'Vestidos',
    description: 'Categoria textual asociada al producto.',
  })
  @IsString()
  @MaxLength(100)
  categoria: string;

  @ApiProperty({
    example: 'Noir & Blanc Atelier',
    description: 'Marca textual asociada al producto.',
  })
  @IsString()
  @MaxLength(100)
  marca: string;

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
  @IsUrl()
  @MaxLength(500)
  imagenPrincipal?: string;

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
  @IsUrl({}, { each: true })
  @MaxLength(500, { each: true })
  imagenes?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el producto esta activo para venta.',
    default: true,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  activo?: boolean;
}
