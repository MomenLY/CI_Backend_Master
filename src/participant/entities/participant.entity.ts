import { User } from "src/users/entities/user.entity";
import { 
    BaseEntity,
    Column, 
    Entity, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";

const databaseType = process.env.DB_TYPE || 'postgres';

@Entity({ database: databaseType })
export class Participant extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    epUserId: string;

    @Column('uuid')
    epExpoId: string;

    @Column('json')
    epUserDetails: any;

    @Column({ default: false })
    epStatus: boolean;

    @Column({ type: 'varchar' })
    epOrderid: string;

    @Column('uuid')
    epCreatedBy: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    epCreatedAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    epUpdatedAt: Date;

    @Column({ type: 'boolean', nullable: true })
    epAttendance?: boolean;

    @Column({ type: 'json', nullable: true })
    epAttendeeLog?: any;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'epUserId', referencedColumnName: '_id' })
    user: User;
}
