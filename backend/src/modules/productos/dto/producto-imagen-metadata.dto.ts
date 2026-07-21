import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ProductoImagenMetadataDto {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-1.jpg',
    description: 'URL segura de la imagen almacenada en Cloudinary.',
  })
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({
    example: 'noir-blanc/productos/vestido-midi-1',
    description: 'Identificador publico de Cloudinary asociado a la imagen.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publicId?: string | null;
}
