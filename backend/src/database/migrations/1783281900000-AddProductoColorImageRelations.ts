import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductoColorImageRelations1783281900000 implements MigrationInterface {
  name = 'AddProductoColorImageRelations1783281900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "imagenPrincipalColor" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "imagenesPorColor" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "imagenesPorColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN IF EXISTS "imagenPrincipalColor"`,
    );
  }
}
