import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1782773029181 implements MigrationInterface {
    name = 'Tables1782773029181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "novedad" ("id" SERIAL NOT NULL, "tipo" character varying(30) NOT NULL, "estado" character varying(20) NOT NULL DEFAULT 'BORRADOR', "fecha_inicio" date NOT NULL, "fecha_fin" date, "descripcion" text, "creada_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizada_en" TIMESTAMP NOT NULL DEFAULT now(), "filial_id" integer NOT NULL, "solicitante_id" integer NOT NULL, "aprobador_id" integer, CONSTRAINT "PK_343018332066d73858ac081f1d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_rol" AS ENUM('COLABORADOR', 'SUPERVISOR', 'RRHH')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "email" character varying(160) NOT NULL, "nombre" character varying(160) NOT NULL, "contrasena" character varying(255) NOT NULL, "rol" "public"."usuario_rol" NOT NULL, "filial_id" integer NOT NULL, "creada_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizada_en" TIMESTAMP NOT NULL DEFAULT now(), "supervisor_id" integer, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "filial" ("id" SERIAL NOT NULL, "nombre" character varying(120) NOT NULL, "codigo" character varying(20) NOT NULL, "creada_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizada_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e73fdf2b09a58f2340afef6d50e" UNIQUE ("codigo"), CONSTRAINT "PK_033991e7ce2accca4cfe6cdf345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auditoria" ("id" BIGSERIAL NOT NULL, "accion" character varying(40) NOT NULL, "entidad" character varying(40) NOT NULL, "entidad_id" bigint, "detalle" jsonb, "creada_en" TIMESTAMP NOT NULL DEFAULT now(), "actor_id" integer NOT NULL, "filial_id" integer NOT NULL, CONSTRAINT "PK_135fe98308816fe3a2d458e6637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "novedad" ADD CONSTRAINT "FK_6601c13aecf1cdc9ab887156f8e" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "novedad" ADD CONSTRAINT "FK_e14f1bfd8405f3b9bc3d77fafda" FOREIGN KEY ("solicitante_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "novedad" ADD CONSTRAINT "FK_00121e38e0535703bc1dfa6c5a1" FOREIGN KEY ("aprobador_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_a61f126174b50552f82f3b5974c" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_7d5d4b6c72d7b4b81b92364b5df" FOREIGN KEY ("supervisor_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_9d7312f040a384395d6e5fa3cb7" FOREIGN KEY ("actor_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_cf3f0a2ac721b297d648626f997" FOREIGN KEY ("filial_id") REFERENCES "filial"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_cf3f0a2ac721b297d648626f997"`);
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_9d7312f040a384395d6e5fa3cb7"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_7d5d4b6c72d7b4b81b92364b5df"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_a61f126174b50552f82f3b5974c"`);
        await queryRunner.query(`ALTER TABLE "novedad" DROP CONSTRAINT "FK_00121e38e0535703bc1dfa6c5a1"`);
        await queryRunner.query(`ALTER TABLE "novedad" DROP CONSTRAINT "FK_e14f1bfd8405f3b9bc3d77fafda"`);
        await queryRunner.query(`ALTER TABLE "novedad" DROP CONSTRAINT "FK_6601c13aecf1cdc9ab887156f8e"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP TABLE "filial"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_rol"`);
        await queryRunner.query(`DROP TABLE "novedad"`);
    }

}
