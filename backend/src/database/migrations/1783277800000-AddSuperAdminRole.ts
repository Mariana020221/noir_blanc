import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminRole1783277800000 implements MigrationInterface {
  name = 'AddSuperAdminRole1783277800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."usuarios_rol_enum" RENAME TO "usuarios_rol_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('SUPER_ADMIN', 'ADMIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "public"."usuarios_rol_enum" USING "rol"::"text"::"public"."usuarios_rol_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'ADMIN'`,
    );
    await queryRunner.query(
      `UPDATE "usuarios" SET "rol" = 'SUPER_ADMIN' WHERE "id" = (SELECT "id" FROM "usuarios" WHERE "deletedAt" IS NULL ORDER BY "createdAt" ASC, "id" ASC LIMIT 1)`,
    );
    await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "usuarios" SET "rol" = 'ADMIN' WHERE "rol" = 'SUPER_ADMIN'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."usuarios_rol_enum" RENAME TO "usuarios_rol_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('ADMIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" TYPE "public"."usuarios_rol_enum" USING "rol"::"text"::"public"."usuarios_rol_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'ADMIN'`,
    );
    await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum_old"`);
  }
}
