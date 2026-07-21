import {
  validateProductImageFile,
  validateProductImageFiles,
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

  it('acepta lotes de imagenes sin aplicar validaciones adicionales', () => {
    expect(() =>
      validateProductImageFiles([
        buildFile(),
        buildFile({
          mimetype: 'image/gif',
          size: 8_000_000,
        }),
      ]),
    ).not.toThrow();
  });
});
