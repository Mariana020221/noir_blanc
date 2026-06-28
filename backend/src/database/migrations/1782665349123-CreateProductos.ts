import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductos1782665349123 implements MigrationInterface {
    name = 'CreateProductos1782665349123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "productos" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "descripcion" text NOT NULL, "precio" numeric(10,2) NOT NULL, "existencia" integer NOT NULL DEFAULT '0', "categoria" character varying(100) NOT NULL, "marca" character varying(100) NOT NULL, "tallas" text array NOT NULL DEFAULT '{}', "colores" text array NOT NULL DEFAULT '{}', "imagenPrincipal" text, "imagenes" text array NOT NULL DEFAULT '{}', "activo" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "productos"`);
    }

}
