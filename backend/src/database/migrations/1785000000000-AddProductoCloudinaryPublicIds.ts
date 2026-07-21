import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductoCloudinaryPublicIds1785000000000 implements MigrationInterface {
  name = 'AddProductoCloudinaryPublicIds1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "imagenPrincipalPublicId" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "imagenesMetadata" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(
      `UPDATE "productos"
        SET "imagenesMetadata" = COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'url',
                image_url,
                'publicId',
                NULL
              )
            )
            FROM unnest("imagenes") AS image_url
          ),
          '[]'::jsonb
        )
        WHERE COALESCE(jsonb_array_length("imagenesMetadata"), 0) = 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "imagenesMetadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "imagenPrincipalPublicId"`,
    );
  }
}
