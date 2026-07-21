import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const validateProductImageFile = (_file: Express.Multer.File): void => {};

export const validateProductImageFiles = (
  _files: Express.Multer.File[],
): void => {};

export const productImageMulterOptions: MulterOptions = {
  storage: memoryStorage(),
};
