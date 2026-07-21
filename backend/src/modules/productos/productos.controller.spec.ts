import { BadRequestException } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

const buildFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File => ({
  fieldname: 'image',
  originalname: 'producto.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: '',
  filename: '',
  path: '',
  stream: undefined as never,
  buffer: Buffer.from('demo'),
  ...overrides,
});

describe('ProductosController', () => {
  let controller: ProductosController;
  let productosService: jest.Mocked<Pick<ProductosService, 'uploadImages'>>;

  beforeEach(() => {
    productosService = {
      uploadImages: jest.fn(),
    };

    controller = new ProductosController(
      productosService as unknown as ProductosService,
    );
  });

  it('sube imagenes validas y devuelve la informacion de Cloudinary', async () => {
    const file = buildFile();

    productosService.uploadImages.mockResolvedValue([
      {
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/producto.jpg',
        publicId: 'noir-blanc/productos/producto',
        width: 1200,
        height: 1600,
        format: 'jpg',
        bytes: 2048,
      },
    ]);

    await expect(
      controller.uploadImages({
        image: [file],
      }),
    ).resolves.toEqual({
      images: [
        {
          secureUrl:
            'https://res.cloudinary.com/demo/image/upload/producto.jpg',
          publicId: 'noir-blanc/productos/producto',
          width: 1200,
          height: 1600,
          format: 'jpg',
          bytes: 2048,
        },
      ],
      paths: ['https://res.cloudinary.com/demo/image/upload/producto.jpg'],
    });
    expect(productosService.uploadImages).toHaveBeenCalledWith([file]);
  });

  it('rechaza la peticion cuando no llegan archivos', async () => {
    await expect(controller.uploadImages({})).rejects.toThrow(
      new BadRequestException('Adjunta al menos una imagen.'),
    );
  });
});
