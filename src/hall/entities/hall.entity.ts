import { 
    BaseEntity,
    Column, 
    Entity, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

const databaseType = process.env.DB_TYPE || 'postgres';

@Entity({ database: databaseType })
export class Hall extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column('uuid')
    hallExpoId : string;

    @Column()
    hallName : string;

    @Column()
    hallDescription : string;
	
    @Column({ default: false })
    hallDeleted : boolean;

    @Column({ default: true })
    hallStatus : boolean;

    @Column({ type: 'uuid', nullable: true })
    hallCreatedBy : string;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
  
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}
