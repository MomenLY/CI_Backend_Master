import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from "typeorm";

const databaseType = process.env.DB_TYPE || 'postgres';

@Entity({ database: databaseType })
export class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  schName: string;

  @Column({ type: 'timestamp' })
  schStartDateTime: Date;

  @Column({ type: 'timestamp' })
  schEndDateTime: Date;

  @Column({ type: 'uuid' })
  schHallId: string;

  @Column({ type: 'uuid' })
  schExpoId: string;

  @Column({ type: 'text', nullable: true })
  schDescription: string;

  @Column({ type: 'text', nullable: true })
  schAgenda: string;

  @Column({ type: 'varchar', nullable: true })
  schBannerImage: string;

  @Column({ type: 'varchar', nullable: true })
  schParticipantLink: string;

  @Column({ type: 'varchar', nullable: true })
  schBackstageLink: string;

  @Column({ type: 'uuid' })
  schCreatedBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  schCreatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  schUpdatedAt: Date;

  @Column('uuid', { array: true })
  ssUserId: string[];
}
