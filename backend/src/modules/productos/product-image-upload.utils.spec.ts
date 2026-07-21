import { BadRequestException } from '@nestjs/common';
import {
  invalidProductImageSizeMessage,
  invalidProductImageTypeMessage,
  maxProductImageSizeInBytes,
  validateProductImageFile,
} from './product-image-upload.utils';

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

describe('product-image-upload.utils', () => {
  it('acepta una imagen valida', () => {
    expect(() => validateProductImageFile(buildFile())).not.toThrow();
  });

  it('rechaza un tipo de archivo no permitido', () => {
    expect(() =>
      validateProductImageFile(
        buildFile({
          mimetype: 'image/gif',
        }),
      ),
    ).toThrow(new BadRequestException(invalidProductImageTypeMessage));
  });

  it('rechaza una imagen mayor a 5 MB', () => {
    expect(() =>
      validateProductImageFile(
        buildFile({
          size: maxProductImageSizeInBytes + 1,
        }),
      ),
    ).toThrow(new BadRequestException(invalidProductImageSizeMessage));
  });
});
