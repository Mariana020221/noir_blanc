import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value?: number | null): number | null | undefined => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number(value),
};

class ProductoImagenColor {
  @ApiProperty({
    example: 'https://cdn.noirblanc.local/productos/vestido-midi-1.jpg',
    description: 'URL de la imagen asociada a un color.',
  })
  imagen: string;

  @ApiPropertyOptional({
    example: 'Negro',
    description: 'Color relacionado con la imagen.',
    nullable: true,
  })
  color: string | null;

  @ApiPropertyOptional({
    example: '#f7a6c5',
    description: 'Color visual hexadecimal relacionado con la imagen.',
    nullable: true,
  })
  colorHex: string | null;
}

class ProductoImagenMetadata {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-1.jpg',
    description: 'URL segura de la imagen almacenada en Cloudinary.',
  })
  url: string;

  @ApiPropertyOptional({
    example: 'noir-blanc/productos/vestido-midi-1',
    description: 'Public ID asociado en Cloudinary.',
    nullable: true,
  })
  publicId: string | null;
}

@Entity({ name: 'productos' })
export class Producto {
  @ApiProperty({
    example: 1,
    description: 'Identificador unico del producto.',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Vestido midi satinado',
    description: 'Nombre del producto.',
  })
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @ApiProperty({
    example: 'Vestido elegante con acabado satinado y caida ligera.',
    description: 'Descripcion del producto.',
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    example: 1499.99,
    description: 'Precio del producto.',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  precio: number;

  @ApiProperty({
    example: 12,
    description: 'Existencia disponible del producto.',
  })
  @Column({ type: 'integer', default: 0 })
  existencia: number;

  @ApiProperty({
    example: 'Vestidos',
    description: 'Categoria textual del producto.',
  })
  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  @ApiProperty({
    example: ['Hombre', 'Nuevos'],
    description: 'Categorias multiples asociadas al producto.',
    type: [String],
  })
  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  categorias: string[];

  @ApiProperty({
    example: 'Noir & Blanc Atelier',
    description: 'Marca textual del producto.',
  })
  @Column({ type: 'varchar', length: 100 })
  marca: string;

  @ApiProperty({
    example: ['CH', 'M', 'G'],
    description: 'Tallas disponibles del producto.',
    type: [String],
  })
  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  tallas: string[];

  @ApiProperty({
    example: ['Negro', 'Marfil'],
    description: 'Colores disponibles del producto.',
    type: [String],
  })
  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  colores: string[];

  @ApiPropertyOptional({
    example: 'https://cdn.noirblanc.local/productos/vestido-midi-cover.jpg',
    description: 'URL de la imagen principal.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  imagenPrincipal: string | null;

  @ApiPropertyOptional({
    example: 'noir-blanc/productos/vestido-midi-cover',
    description: 'Public ID de Cloudinary para la imagen principal.',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imagenPrincipalPublicId: string | null;

  @ApiPropertyOptional({
    example: 'Negro',
    description: 'Color relacionado con la imagen principal.',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  imagenPrincipalColor: string | null;

  @ApiPropertyOptional({
    example: '#f7a6c5',
    description:
      'Color visual hexadecimal relacionado con la imagen principal.',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  imagenPrincipalColorHex: string | null;

  @ApiProperty({
    example: [
      'https://cdn.noirblanc.local/productos/vestido-midi-1.jpg',
      'https://cdn.noirblanc.local/productos/vestido-midi-2.jpg',
    ],
    description: 'URLs de imagenes adicionales.',
    type: [String],
  })
  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  imagenes: string[];

  @ApiProperty({
    description:
      'Metadata de Cloudinary para las imagenes adicionales guardadas.',
    type: [ProductoImagenMetadata],
    example: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-1.jpg',
        publicId: 'noir-blanc/productos/vestido-midi-1',
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/vestido-midi-2.jpg',
        publicId: 'noir-blanc/productos/vestido-midi-2',
      },
    ],
  })
  @Column({
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  imagenesMetadata: ProductoImagenMetadata[];

  @ApiProperty({
    description: 'Relacion de imagenes adicionales con su color.',
    type: [ProductoImagenColor],
    example: [
      {
        imagen: 'https://cdn.noirblanc.local/productos/vestido-midi-1.jpg',
        color: 'Negro',
      },
      {
        imagen: 'https://cdn.noirblanc.local/productos/vestido-midi-2.jpg',
        color: 'Marfil',
      },
    ],
  })
  @Column({
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  imagenesPorColor: ProductoImagenColor[];

  @ApiProperty({
    example: true,
    description: 'Indica si el producto esta activo.',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ApiProperty({
    example: '2026-06-28T10:30:00.000Z',
    description: 'Fecha de creacion del registro.',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-28T10:45:00.000Z',
    description: 'Fecha de la ultima actualizacion del registro.',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '2026-06-28T11:00:00.000Z',
    description: 'Fecha de borrado logico del registro.',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
