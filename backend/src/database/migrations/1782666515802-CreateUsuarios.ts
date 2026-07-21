import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarios1782666515802 implements MigrationInterface {
  name = 'CreateUsuarios1782666515802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "nombre" character varying(120) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying(255) NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL DEFAULT 'ADMIN', "activo" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
  }
}
