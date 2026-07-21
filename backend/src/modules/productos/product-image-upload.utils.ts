import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const allowedProductImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export const maxProductImageSizeInBytes = 5 * 1024 * 1024;

export const invalidProductImageTypeMessage =
  'Solo se permiten imagenes JPG, PNG, WEBP o AVIF.';

export const invalidProductImageSizeMessage =
  'Cada imagen debe pesar como maximo 5 MB.';

export const validateProductImageFile = (file: Express.Multer.File): void => {
  if (!allowedProductImageMimeTypes.has(file.mimetype)) {
    throw new BadRequestException(invalidProductImageTypeMessage);
  }

  if (file.size > maxProductImageSizeInBytes) {
    throw new BadRequestException(invalidProductImageSizeMessage);
  }
};

export const validateProductImageFiles = (
  files: Express.Multer.File[],
): void => {
  files.forEach((file) => validateProductImageFile(file));
};

export const productImageMulterOptions: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!allowedProductImageMimeTypes.has(file.mimetype)) {
      callback(new BadRequestException(invalidProductImageTypeMessage), false);
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: maxProductImageSizeInBytes,
  },
};
