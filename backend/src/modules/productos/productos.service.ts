import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

  private normalizeCategorias(
    categoria: string,
    categorias?: string[] | null,
  ): string[] {
    const normalizedCategorias = (categorias ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (normalizedCategorias.length > 0) {
      return Array.from(new Set(normalizedCategorias));
    }

    const normalizedCategoria = categoria.trim();

    return normalizedCategoria ? [normalizedCategoria] : [];
  }

  async create(createProductoDto: CrearProductoDto): Promise<Producto> {
    const categorias = this.normalizeCategorias(
      createProductoDto.categoria,
      createProductoDto.categorias,
    );
    const { categoria, ...restCreateProductoDto } = createProductoDto;

    const producto = this.productosRepository.create({
      ...restCreateProductoDto,
      activo: true,
      categoria: categorias[0] ?? categoria,
      categorias,
      tallas: [],
      colores: [],
      imagenes: [],
      imagenPrincipalColor: null,
      imagenPrincipalColorHex: null,
      imagenesPorColor: [],
    });

    return this.productosRepository.save(producto);
  }

  async findAll(filters: BuscarProductosDto): Promise<Producto[]> {
    const query = this.productosRepository.createQueryBuilder('producto');

    if (filters.nombre?.trim()) {
      query.andWhere('producto.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre.trim()}%`,
      });
    }

    if (filters.categoria?.trim()) {
      const categoria = filters.categoria.trim();

      query.andWhere(
        new Brackets((subQuery) => {
          subQuery
            .where('producto.categoria ILIKE :categoriaLike', {
              categoriaLike: `%${categoria}%`,
            })
            .orWhere(':categoriaExact = ANY(producto.categorias)', {
              categoriaExact: categoria,
            });
        }),
      );
    }

    if (filters.marca?.trim()) {
      query.andWhere('producto.marca ILIKE :marca', {
        marca: `%${filters.marca.trim()}%`,
      });
    }

    if (typeof filters.activo === 'boolean') {
      query.andWhere('producto.activo = :activo', {
        activo: filters.activo,
      });
    }

    return query.orderBy('producto.createdAt', 'DESC').getMany();
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
    const actual = await this.findOne(id);
    const categorias =
      actualizarProductoDto.categoria || actualizarProductoDto.categorias
        ? this.normalizeCategorias(
            actualizarProductoDto.categoria ?? actual.categoria,
            actualizarProductoDto.categorias ?? actual.categorias,
          )
        : actual.categorias;

    const producto = await this.productosRepository.preload({
      id,
      ...actualizarProductoDto,
      categoria:
        categorias[0] ??
        actualizarProductoDto.categoria ??
        actual.categoria,
      categorias,
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
