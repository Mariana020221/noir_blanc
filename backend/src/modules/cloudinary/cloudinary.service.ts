import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';
import { getCloudinaryEnvironment } from '../../config/cloudinary.config';

export interface CloudinaryUploadedImage {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const { apiKey, apiSecret, cloudName } = getCloudinaryEnvironment(
      this.configService,
    );

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'noir-blanc/productos',
  ): Promise<CloudinaryUploadedImage> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error, response) => {
            if (error || !response) {
              reject(
                new Error(
                  error?.message ?? 'Cloudinary no devolvio respuesta valida.',
                ),
              );
              return;
            }

            resolve(response);
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });

      return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      this.logger.error(
        `Fallo al subir una imagen a Cloudinary: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      );
      throw new InternalServerErrorException(
        'No fue posible subir la imagen en este momento.',
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const destroyResponse: unknown =
        await cloudinary.uploader.destroy(publicId);
      const result =
        typeof destroyResponse === 'object' &&
        destroyResponse !== null &&
        'result' in destroyResponse &&
        typeof destroyResponse.result === 'string'
          ? destroyResponse.result
          : undefined;

      if (result === 'ok' || result === 'not found') {
        return;
      }

      throw new Error(
        `Cloudinary respondio con un resultado inesperado: ${result ?? 'sin resultado'}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al eliminar la imagen ${publicId} en Cloudinary: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      );
      throw new InternalServerErrorException(
        'No fue posible eliminar la imagen en este momento.',
      );
    }
  }
}
