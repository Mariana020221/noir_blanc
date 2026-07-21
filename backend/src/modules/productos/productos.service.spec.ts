import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';

const buildProducto = (overrides: Partial<Producto> = {}): Producto => ({
  id: 1,
  nombre: 'Vestido midi satinado',
  descripcion: 'Descripcion de prueba',
  precio: 1499.99,
  existencia: 12,
  categoria: 'Vestidos',
  categorias: ['Vestidos'],
  marca: 'Noir&Blanc',
  tallas: ['CH', 'M'],
  colores: ['Negro'],
  imagenPrincipal:
    'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/cover.jpg',
  imagenPrincipalPublicId: 'noir-blanc/productos/cover',
  imagenPrincipalColor: 'Negro',
  imagenPrincipalColorHex: '#181614',
  imagenes: [
    'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-1.jpg',
  ],
  imagenesMetadata: [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-1.jpg',
      publicId: 'noir-blanc/productos/extra-1',
    },
  ],
  imagenesPorColor: [
    {
      imagen:
        'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-1.jpg',
      color: 'Negro',
      colorHex: '#181614',
    },
  ],
  activo: true,
  createdAt: new Date('2026-07-14T00:00:00.000Z'),
  updatedAt: new Date('2026-07-14T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('ProductosService', () => {
  let service: ProductosService;
  let productosRepository: {
    create: jest.Mock<Partial<Producto>, [Partial<Producto>]>;
    save: jest.Mock<Promise<Producto>, [Partial<Producto>]>;
    findOne: jest.Mock<Promise<Producto | null>, [unknown]>;
    preload: jest.Mock<Promise<Producto | undefined>, [Partial<Producto>]>;
    softDelete: jest.Mock<Promise<unknown>, [number]>;
    createQueryBuilder: jest.Mock;
  };
  let cloudinaryService: {
    uploadImage: jest.Mock;
    deleteImage: jest.Mock;
  };

  beforeEach(() => {
    productosRepository = {
      create: jest.fn((entity: Partial<Producto>) => entity),
      save: jest.fn((entity: Partial<Producto>) =>
        Promise.resolve({
          ...buildProducto(),
          ...entity,
          id: entity.id ?? 1,
          createdAt: entity.createdAt ?? new Date('2026-07-14T00:00:00.000Z'),
          updatedAt: new Date('2026-07-14T00:00:00.000Z'),
          deletedAt: null,
        }),
      ),
      findOne: jest.fn<Promise<Producto | null>, [unknown]>(),
      preload: jest.fn<Promise<Producto | undefined>, [Partial<Producto>]>(),
      softDelete: jest.fn<Promise<unknown>, [number]>(),
      createQueryBuilder: jest.fn(),
    };
    cloudinaryService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn().mockResolvedValue(undefined),
    };

    service = new ProductosService(
      productosRepository as never,
      cloudinaryService as never,
    );
  });

  it('guarda la URL y el public_id al crear un producto con imagen', async () => {
    productosRepository.save.mockImplementation((entity: Partial<Producto>) =>
      Promise.resolve({
        ...buildProducto(),
        ...entity,
      }),
    );

    const created = await service.create({
      nombre: 'Vestido midi satinado',
      descripcion: 'Descripcion de prueba',
      precio: 1499.99,
      existencia: 12,
      categoria: 'Vestidos',
      categorias: ['Vestidos'],
      marca: 'Noir & Blanc',
      tallas: ['CH', 'M'],
      colores: ['Negro'],
      imagenPrincipal:
        'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/new-cover.jpg',
      imagenPrincipalPublicId: 'noir-blanc/productos/new-cover',
      imagenPrincipalColor: 'Negro',
      imagenPrincipalColorHex: '#181614',
      imagenes: [
        'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
      ],
      imagenesMetadata: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
          publicId: 'noir-blanc/productos/extra-2',
        },
      ],
      imagenesPorColor: [
        {
          imagen:
            'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
          color: 'Negro',
          colorHex: '#181614',
        },
      ],
      activo: true,
    });

    expect(productosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        imagenPrincipal:
          'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/new-cover.jpg',
        imagenPrincipalPublicId: 'noir-blanc/productos/new-cover',
        imagenes: [
          'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
        ],
        imagenesMetadata: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
            publicId: 'noir-blanc/productos/extra-2',
          },
        ],
      }),
    );
    expect(created.imagenPrincipalPublicId).toBe(
      'noir-blanc/productos/new-cover',
    );
    expect(created.imagenesMetadata).toEqual([
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
        publicId: 'noir-blanc/productos/extra-2',
      },
    ]);
  });

  it('mantiene la imagen actual cuando se actualiza sin nueva imagen', async () => {
    const actual = buildProducto();

    productosRepository.findOne.mockResolvedValue(actual);
    productosRepository.preload.mockResolvedValue({
      ...actual,
      nombre: 'Vestido midi actualizado',
    });
    productosRepository.save.mockResolvedValue({
      ...actual,
      nombre: 'Vestido midi actualizado',
    });

    const updated = await service.update(1, {
      nombre: 'Vestido midi actualizado',
    });

    expect(productosRepository.preload).toHaveBeenCalledWith(
      expect.objectContaining({
        imagenPrincipal: actual.imagenPrincipal,
        imagenPrincipalPublicId: actual.imagenPrincipalPublicId,
      }),
    );
    expect(updated.imagenPrincipalPublicId).toBe(
      actual.imagenPrincipalPublicId,
    );
    expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
  });

  it('elimina la imagen anterior despues de guardar una nueva imagen', async () => {
    const actual = buildProducto();
    const nuevaImagenUrl =
      'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/new-cover.jpg';
    const nuevoPublicId = 'noir-blanc/productos/new-cover';

    productosRepository.findOne.mockResolvedValue(actual);
    productosRepository.preload.mockResolvedValue({
      ...actual,
      imagenPrincipal: nuevaImagenUrl,
      imagenPrincipalPublicId: nuevoPublicId,
    });
    productosRepository.save.mockResolvedValue({
      ...actual,
      imagenPrincipal: nuevaImagenUrl,
      imagenPrincipalPublicId: nuevoPublicId,
    });

    const updated = await service.update(1, {
      imagenPrincipal: nuevaImagenUrl,
      imagenPrincipalPublicId: nuevoPublicId,
    });

    expect(updated.imagenPrincipalPublicId).toBe(nuevoPublicId);
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
      'noir-blanc/productos/cover',
    );
  });

  it('elimina las imagenes asociadas al borrar un producto', async () => {
    const actual = buildProducto();

    productosRepository.findOne.mockResolvedValue(actual);
    productosRepository.softDelete.mockResolvedValue({ affected: 1 });

    await service.remove(1);

    expect(productosRepository.softDelete).toHaveBeenCalledWith(1);
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
      'noir-blanc/productos/cover',
    );
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
      'noir-blanc/productos/extra-1',
    );
  });

  it('hace rollback de las imagenes nuevas si falla el guardado en base de datos', async () => {
    productosRepository.save.mockRejectedValue(new Error('DB down'));

    await expect(
      service.create({
        nombre: 'Vestido midi satinado',
        descripcion: 'Descripcion de prueba',
        precio: 1499.99,
        existencia: 12,
        categoria: 'Vestidos',
        categorias: ['Vestidos'],
        marca: 'Noir & Blanc',
        tallas: ['CH', 'M'],
        colores: ['Negro'],
        imagenPrincipal:
          'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/new-cover.jpg',
        imagenPrincipalPublicId: 'noir-blanc/productos/new-cover',
        imagenes: [
          'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
        ],
        imagenesMetadata: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/v1/noir-blanc/productos/extra-2.jpg',
            publicId: 'noir-blanc/productos/extra-2',
          },
        ],
        activo: true,
      }),
    ).rejects.toThrow('DB down');

    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
      'noir-blanc/productos/new-cover',
    );
    expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
      'noir-blanc/productos/extra-2',
    );
  });
});
