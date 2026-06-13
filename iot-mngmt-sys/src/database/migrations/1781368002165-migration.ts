import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781368002165 implements MigrationInterface {
    name = 'Migration1781368002165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tarriff_rate" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tarriff_rate"`);
    }

}
