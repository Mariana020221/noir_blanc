import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { toBoolean } from './producto-dto.transforms';

export class BuscarProductosDto {
  @ApiPropertyOptional({
    example: 'vestido',
    description: 'Filtra por coincidencia parcial en el nombre.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Vestidos',
    description: 'Filtra por coincidencia parcial en la categoria.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @ApiPropertyOptional({
    example: 'Noir & Blanc Atelier',
    description: 'Filtra por coincidencia parcial en la marca.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filtra por estado activo o inactivo.',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  activo?: boolean;
}
