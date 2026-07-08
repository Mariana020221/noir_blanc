import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductoCategoriasAndColorHex1783283100000
  implements MigrationInterface
{
  name = 'AddProductoCategoriasAndColorHex1783283100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "categorias" text[] NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `UPDATE "productos" SET "categorias" = ARRAY["categoria"] WHERE COALESCE(array_length("categorias", 1), 0) = 0 AND "categoria" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "imagenPrincipalColorHex" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "imagenPrincipalColorHex"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "categorias"`,
    );
  }
}
