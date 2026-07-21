import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { BuscarProductosDto } from './dto/buscar-productos.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ImagenProductoColorDto } from './dto/imagen-producto-color.dto';
import { ProductoImagenMetadataDto } from './dto/producto-imagen-metadata.dto';
import { Producto } from './entities/producto.entity';

interface ProductoImagenMetadataState {
  url: string;
  publicId: string | null;
}

interface ProductoImagenColorState {
  imagen: string;
  color: string | null;
  colorHex: string | null;
}

interface ProductoCloudinaryState {
  imagenPrincipalPublicId: string | null;
  imagenesMetadata: ProductoImagenMetadataState[];
}

@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    private readonly cloudinaryService: CloudinaryService,
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

  private normalizeTextArray(values?: string[] | null): string[] {
    const normalizedValues = new Map<string, string>();

    (values ?? []).forEach((value) => {
      const normalizedValue = value?.trim();

      if (!normalizedValue) {
        return;
      }

      const normalizedKey = normalizedValue.toLowerCase();

      if (!normalizedValues.has(normalizedKey)) {
        normalizedValues.set(normalizedKey, normalizedValue);
      }
    });

    return Array.from(normalizedValues.values());
  }

  private normalizeNullableText(
    value: string | null | undefined,
  ): string | null {
    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : null;
  }

  private normalizeImageMetadata(
    imagenes?: string[] | null,
    imagenesMetadata?: ProductoImagenMetadataDto[] | null,
  ): ProductoImagenMetadataState[] {
    const metadataByUrl = new Map<string, ProductoImagenMetadataState>();

    (imagenesMetadata ?? []).forEach((item) => {
      const url = this.normalizeNullableText(item?.url);

      if (!url) {
        return;
      }

      const normalizedKey = url.toLowerCase();

      if (!metadataByUrl.has(normalizedKey)) {
        metadataByUrl.set(normalizedKey, {
          url,
          publicId: this.normalizeNullableText(item.publicId),
        });
      }
    });

    const orderedUrls = this.normalizeTextArray([
      ...(imagenes ?? []),
      ...(imagenesMetadata ?? []).map((item) => item.url),
    ]);

    return orderedUrls.map((url) => {
      const normalizedKey = url.toLowerCase();

      return (
        metadataByUrl.get(normalizedKey) ?? {
          url,
          publicId: null,
        }
      );
    });
  }

  private normalizeImageAssignments(
    assignments: ImagenProductoColorDto[] | undefined,
    validImageUrls: string[],
  ): ProductoImagenColorState[] {
    const validImages = new Set(
      validImageUrls.map((item) => item.toLowerCase()),
    );

    return (assignments ?? [])
      .map((assignment) => {
        const imagen = this.normalizeNullableText(assignment.imagen);

        if (!imagen || !validImages.has(imagen.toLowerCase())) {
          return null;
        }

        return {
          imagen,
          color: this.normalizeNullableText(assignment.color),
          colorHex: this.normalizeNullableText(assignment.colorHex),
        };
      })
      .filter(
        (assignment): assignment is ProductoImagenColorState =>
          assignment !== null,
      );
  }

  private getCurrentCloudinaryState(
    producto: Producto,
  ): ProductoCloudinaryState {
    return {
      imagenPrincipalPublicId: this.normalizeNullableText(
        producto.imagenPrincipalPublicId,
      ),
      imagenesMetadata: this.normalizeImageMetadata(
        producto.imagenes,
        producto.imagenesMetadata,
      ),
    };
  }

  private collectCloudinaryPublicIds(state: ProductoCloudinaryState): string[] {
    const uniquePublicIds = new Set<string>();

    if (state.imagenPrincipalPublicId) {
      uniquePublicIds.add(state.imagenPrincipalPublicId);
    }

    state.imagenesMetadata.forEach((item) => {
      const publicId = this.normalizeNullableText(item.publicId);

      if (publicId) {
        uniquePublicIds.add(publicId);
      }
    });

    return Array.from(uniquePublicIds.values());
  }

  private collectNewCloudinaryPublicIds(
    previousState: ProductoCloudinaryState,
    nextState: ProductoCloudinaryState,
  ): string[] {
    const previousIds = new Set(this.collectCloudinaryPublicIds(previousState));

    return this.collectCloudinaryPublicIds(nextState).filter(
      (publicId) => !previousIds.has(publicId),
    );
  }

  private collectRemovedCloudinaryPublicIds(
    previousState: ProductoCloudinaryState,
    nextState: ProductoCloudinaryState,
  ): string[] {
    const nextIds = new Set(this.collectCloudinaryPublicIds(nextState));

    return this.collectCloudinaryPublicIds(previousState).filter(
      (publicId) => !nextIds.has(publicId),
    );
  }

  private hydrateProductoImages(producto: Producto): Producto {
    producto.imagenPrincipal = this.normalizeNullableText(
      producto.imagenPrincipal,
    );
    producto.imagenPrincipalPublicId = this.normalizeNullableText(
      producto.imagenPrincipalPublicId,
    );
    producto.imagenesMetadata = this.normalizeImageMetadata(
      producto.imagenes,
      producto.imagenesMetadata,
    );
    producto.imagenes = producto.imagenesMetadata.map((item) => item.url);

    return producto;
  }

  private async deleteCloudinaryImagesBestEffort(
    publicIds: string[],
    context: string,
  ): Promise<void> {
    if (publicIds.length === 0) {
      return;
    }

    const cleanupResults = await Promise.allSettled(
      publicIds.map((publicId) => this.cloudinaryService.deleteImage(publicId)),
    );

    cleanupResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `No fue posible limpiar la imagen ${publicIds[index]} durante ${context}: ${
            result.reason instanceof Error
              ? result.reason.message
              : 'error desconocido'
          }`,
        );
      }
    });
  }

  async create(createProductoDto: CrearProductoDto): Promise<Producto> {
    const categorias = this.normalizeCategorias(
      createProductoDto.categoria,
      createProductoDto.categorias,
    );
    const { categoria, ...restCreateProductoDto } = createProductoDto;
    const imagenPrincipal = this.normalizeNullableText(
      createProductoDto.imagenPrincipal,
    );
    const imagenPrincipalPublicId = imagenPrincipal
      ? this.normalizeNullableText(createProductoDto.imagenPrincipalPublicId)
      : null;
    const imagenesMetadata = this.normalizeImageMetadata(
      createProductoDto.imagenes,
      createProductoDto.imagenesMetadata,
    );
    const imagenesPorColor = this.normalizeImageAssignments(
      createProductoDto.imagenesPorColor,
      imagenesMetadata.map((item) => item.url),
    );
    const nextCloudinaryState: ProductoCloudinaryState = {
      imagenPrincipalPublicId,
      imagenesMetadata,
    };

    const producto = this.productosRepository.create({
      ...restCreateProductoDto,
      activo: createProductoDto.activo ?? true,
      categoria: categorias[0] ?? categoria,
      categorias,
      tallas: this.normalizeTextArray(createProductoDto.tallas),
      colores: this.normalizeTextArray(createProductoDto.colores),
      imagenPrincipal,
      imagenPrincipalPublicId,
      imagenPrincipalColor: imagenPrincipal
        ? this.normalizeNullableText(createProductoDto.imagenPrincipalColor)
        : null,
      imagenPrincipalColorHex: imagenPrincipal
        ? this.normalizeNullableText(createProductoDto.imagenPrincipalColorHex)
        : null,
      imagenes: imagenesMetadata.map((item) => item.url),
      imagenesMetadata,
      imagenesPorColor,
    });

    try {
      const createdProducto = await this.productosRepository.save(producto);

      return this.hydrateProductoImages(createdProducto);
    } catch (error) {
      await this.deleteCloudinaryImagesBestEffort(
        this.collectCloudinaryPublicIds(nextCloudinaryState),
        'el rollback de la creacion del producto',
      );
      throw error;
    }
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

    const productos = await query
      .orderBy('producto.createdAt', 'DESC')
      .getMany();

    return productos.map((producto) => this.hydrateProductoImages(producto));
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }

    return this.hydrateProductoImages(producto);
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
    const actualCloudinaryState = this.getCurrentCloudinaryState(actual);
    const imagenPrincipal =
      actualizarProductoDto.imagenPrincipal !== undefined
        ? this.normalizeNullableText(actualizarProductoDto.imagenPrincipal)
        : actual.imagenPrincipal;
    const imagenPrincipalPublicId = imagenPrincipal
      ? actualizarProductoDto.imagenPrincipalPublicId !== undefined
        ? this.normalizeNullableText(
            actualizarProductoDto.imagenPrincipalPublicId,
          )
        : actualCloudinaryState.imagenPrincipalPublicId
      : null;
    const imagenesMetadata =
      actualizarProductoDto.imagenes !== undefined ||
      actualizarProductoDto.imagenesMetadata !== undefined
        ? this.normalizeImageMetadata(
            actualizarProductoDto.imagenes,
            actualizarProductoDto.imagenesMetadata,
          )
        : actualCloudinaryState.imagenesMetadata;
    const imagenesPorColor =
      actualizarProductoDto.imagenesPorColor !== undefined
        ? this.normalizeImageAssignments(
            actualizarProductoDto.imagenesPorColor,
            imagenesMetadata.map((item) => item.url),
          )
        : this.normalizeImageAssignments(
            actual.imagenesPorColor,
            imagenesMetadata.map((item) => item.url),
          );
    const nextCloudinaryState: ProductoCloudinaryState = {
      imagenPrincipalPublicId,
      imagenesMetadata,
    };

    const producto = await this.productosRepository.preload({
      ...actual,
      id,
      ...actualizarProductoDto,
      categoria:
        categorias[0] ?? actualizarProductoDto.categoria ?? actual.categoria,
      categorias,
      tallas:
        actualizarProductoDto.tallas !== undefined
          ? this.normalizeTextArray(actualizarProductoDto.tallas)
          : actual.tallas,
      colores:
        actualizarProductoDto.colores !== undefined
          ? this.normalizeTextArray(actualizarProductoDto.colores)
          : actual.colores,
      imagenPrincipal,
      imagenPrincipalPublicId,
      imagenPrincipalColor: imagenPrincipal
        ? actualizarProductoDto.imagenPrincipalColor !== undefined
          ? this.normalizeNullableText(
              actualizarProductoDto.imagenPrincipalColor,
            )
          : actual.imagenPrincipalColor
        : null,
      imagenPrincipalColorHex: imagenPrincipal
        ? actualizarProductoDto.imagenPrincipalColorHex !== undefined
          ? this.normalizeNullableText(
              actualizarProductoDto.imagenPrincipalColorHex,
            )
          : actual.imagenPrincipalColorHex
        : null,
      imagenes: imagenesMetadata.map((item) => item.url),
      imagenesMetadata,
      imagenesPorColor,
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado.`);
    }

    try {
      const updatedProducto = await this.productosRepository.save(producto);

      await this.deleteCloudinaryImagesBestEffort(
        this.collectRemovedCloudinaryPublicIds(
          actualCloudinaryState,
          nextCloudinaryState,
        ),
        `la limpieza posterior a la actualizacion del producto ${id}`,
      );

      return this.hydrateProductoImages(updatedProducto);
    } catch (error) {
      await this.deleteCloudinaryImagesBestEffort(
        this.collectNewCloudinaryPublicIds(
          actualCloudinaryState,
          nextCloudinaryState,
        ),
        `el rollback de la actualizacion del producto ${id}`,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    const cloudinaryState = this.getCurrentCloudinaryState(producto);

    await this.productosRepository.softDelete(id);
    await this.deleteCloudinaryImagesBestEffort(
      this.collectCloudinaryPublicIds(cloudinaryState),
      `la eliminacion del producto ${id}`,
    );
  }

  async uploadImages(files: Express.Multer.File[]) {
    return Promise.all(
      files.map((file) => this.cloudinaryService.uploadImage(file)),
    );
  }
}
