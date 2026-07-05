import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UsuarioRol {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'usuarios' })
export class Usuario {
  @ApiProperty({
    example: 1,
    description: 'Identificador unico del usuario.',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Administrador Noir & Blanc',
    description: 'Nombre del usuario.',
  })
  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @ApiProperty({
    example: 'admin@noirblanc.com',
    description: 'Correo electronico unico del usuario.',
  })
  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @ApiProperty({
    enum: UsuarioRol,
    enumName: 'UsuarioRol',
    example: UsuarioRol.SUPER_ADMIN,
    description: 'Rol asignado al usuario.',
  })
  @Column({
    type: 'enum',
    enum: UsuarioRol,
    default: UsuarioRol.ADMIN,
  })
  rol: UsuarioRol;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario esta activo.',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ApiProperty({
    example: '2026-06-28T11:30:00.000Z',
    description: 'Fecha de creacion del usuario.',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-28T11:45:00.000Z',
    description: 'Fecha de la ultima actualizacion del usuario.',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '2026-06-28T12:00:00.000Z',
    description: 'Fecha de borrado logico del usuario.',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
