import { MigrationInterface, QueryRunner, Table  } from 'typeorm';

export class init1657774666972 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: "int",
            isPrimary: true,
            isUnique: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },          {
            name: 'guid',
            type: "varchar",
            length: '100',
            isNullable: false,
            isUnique: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          }          
        ],
      }),
      true,
    );

    //applications
    await queryRunner.query(`
          INSERT INTO roles (name, guid) VALUES 
          ('user',    '7a7d386d-ba2d-4c72-923f-973821bc048d')
          ,('admin',   'd5306fc7-fffb-413c-bd4e-5683a952f2a5')
          ,('manager', 'bb12db75-107c-41d0-9a7a-6ed3f52088a4');
          `);
    
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}
