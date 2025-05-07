import { Inject, Injectable } from '@nestjs/common';
import { ProfileFields } from 'src/profileFields/entities/profileFields.entity';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { QueryRunner, Table, TableColumn, TableOptions } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(@Inject(TENANT_CONNECTION) private connection) {}

  async addColumns(profileFields: ProfileFields[]): Promise<void> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    // Start a transaction
    await queryRunner.startTransaction();
    try {
      const hasTable = await queryRunner.hasTable('profile');

      if (!hasTable) {
        const options: TableOptions = {
          name: 'profile',
          columns: [
            {
              name: '_id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
            },
            {
              name: 'userId',
              type: 'uuid',
              foreignKeyConstraintName: 'user._id',
            },
          ],
          foreignKeys: [
            {
              columnNames: ['userId'],
              referencedTableName: 'user',
              referencedColumnNames: ['_id'],
              onDelete: 'CASCADE',
            },
          ],
          uniques: [
            {
              columnNames: ['userId'],
            },
          ],
        };
        await queryRunner.createTable(new Table(options), true);
      }

      const newColumns = [];
      for (const profileField of profileFields) {
        // Check if the column already exists to avoid errors
        const hasColumn = await queryRunner.hasColumn(
          'profile',
          profileField.pFColumName,
        );
        if (!hasColumn) {
          newColumns.push(
            new TableColumn({
              name: profileField.pFColumName,
              type: profileField.pFColumType,
              isNullable: true,
            }),
          );
        }
      }

      if (newColumns.length > 0) {
        // Add the new column
        await queryRunner.addColumns('profile', newColumns);

        // Commit the changes
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      // Rollback changes in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async removeColumns(profileFields: ProfileFields[]): Promise<void> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    // Start a transaction
    await queryRunner.startTransaction();
    try {
      const columnsToDrop = [];
      for (const profileField of profileFields) {
        // Check if the column already exists to avoid errors
        const hasColumn = await queryRunner.hasColumn(
          'profile',
          profileField.pFColumName,
        );
        if (hasColumn) {
          columnsToDrop.push(profileField.pFColumName);
        }
      }

      if (columnsToDrop.length > 0) {
        // Add the new column
        await queryRunner.dropColumns('profile', columnsToDrop);

        // Commit the changes
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      // Rollback changes in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
