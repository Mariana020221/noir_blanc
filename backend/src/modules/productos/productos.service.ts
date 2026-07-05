import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { BuscarProductosDto } from './dto/buscar-productos.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CrearProductoDto): Promise<Producto> {
    const producto = this.productosRepository.create({
      activo: true,
      tallas: [],
      colores: [],
      imagenes: [],
      ...createProductoDto,
    });

    return this.productosRepository.save(producto);
  }

  async findAll(filters: BuscarProductosDto): Promise<Producto[]> {
    const where = {
      ...(filters.nombre ? { nombre: ILike(`%${filters.nombre.trim()}%`) } : {}),
      ...(filters.categoria
        ? { categoria: ILike(`%${filters.categoria.trim()}%`) }
        : {}),
      ...(filters.marca ? { marca: ILike(`%${filters.marca.trim()}%`) } : {}),
      ...(typeof filters.activo === 'boolean'
        ? { activo: filters.activo }
        : {}),
    };

    return this.productosRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }

    return producto;
  }

  async update(
    id: number,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<Producto> {
    await this.findOne(id);

    const producto = await this.productosRepository.preload({
      id,
      ...actualizarProductoDto,
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }

    return this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productosRepository.softDelete(id);
  }

  buildImagePaths(files: Array<{ filename: string }>): string[] {
    return files.map((file) => `/uploads/${file.filename}`);
  }
}
