import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774619110746 implements MigrationInterface {
    name = 'Migration1774619110746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appliances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iot_device_id" uuid NOT NULL, "label" character varying NOT NULL, "rated_power" double precision NOT NULL, "monthly_usage" integer NOT NULL DEFAULT '10', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_479357cafa213820acac2e3389d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_79e5088a1a619c747df006c902" ON "appliances" ("label", "iot_device_id") `);
        await queryRunner.query(`CREATE TABLE "iot_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mac_address" character varying NOT NULL, "label" character varying NOT NULL, "user_id" uuid NOT NULL, "security_token" character varying, "description" character varying, "is_muted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_18bb9b480293e4354b79869facb" UNIQUE ("mac_address"), CONSTRAINT "PK_7e417a9da9d41c781fe234ff196" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_63039ff53a4e1ef303030d3002" ON "iot_devices" ("label", "user_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'engineer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "refresh_token_hash" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'engineer', "phone_number" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appliances" ADD CONSTRAINT "FK_8c7d74e1a929a9e3e943d248ed2" FOREIGN KEY ("iot_device_id") REFERENCES "iot_devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iot_devices" ADD CONSTRAINT "FK_8c22c029a9f40f93a5427d4f72e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "iot_devices" DROP CONSTRAINT "FK_8c22c029a9f40f93a5427d4f72e"`);
        await queryRunner.query(`ALTER TABLE "appliances" DROP CONSTRAINT "FK_8c7d74e1a929a9e3e943d248ed2"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63039ff53a4e1ef303030d3002"`);
        await queryRunner.query(`DROP TABLE "iot_devices"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79e5088a1a619c747df006c902"`);
        await queryRunner.query(`DROP TABLE "appliances"`);
    }

}
