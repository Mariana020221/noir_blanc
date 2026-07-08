import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ImagenProductoColorDto {
  @ApiProperty({
    example: 'https://cdn.noirblanc.local/productos/vestido-midi-1.jpg',
    description: 'URL de la imagen asociada al color.',
  })
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  imagen: string;

  @ApiPropertyOptional({
    example: 'Negro',
    description: 'Color relacionado con esta imagen.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string | null;

  @ApiPropertyOptional({
    example: '#f7a6c5',
    description: 'Valor hexadecimal del color ligado a la imagen.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  colorHex?: string | null;
}
