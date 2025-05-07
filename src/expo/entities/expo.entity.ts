import { 
    BaseEntity,
    Column, 
    Entity, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

export enum ExpoType {
    OFFLINE = 'Offline',
    ONLINE = 'Online',
    HYBRID = 'Hybrid'
}

export enum ExpoMode {
    PRIVATE = 'Private',
    PUBLIC = 'Public'
}

export enum RegType {
    IMMEDIATE = 'Immediate',
    DATE = 'Date',
    DAYS = 'Days'
}

const databaseType = process.env.DB_TYPE || 'postgres';

@Entity({ database: databaseType })
export class Expo extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    expName: string;

    @Column({ type: 'enum', enum: ExpoType, default: ExpoType.OFFLINE })
    expType: ExpoType;

    @CreateDateColumn()
    expStartDate: Date;

    @CreateDateColumn()
    expEndDate: Date;

    @Column()
    expDescription: string;

    @Column({ type: 'uuid', nullable: true })
    expLayoutId: string;

    @Column({ default: false })
    expDeleted: boolean;

    @Column({ type: 'enum', enum: ExpoMode, default: ExpoMode.PUBLIC })
    expExpoMode: ExpoMode;

    @Column({ nullable: true })
    expAddress: string;

    @Column({ default: false })
    expIsPaid: boolean;

    @Column({ default: 0 })
    expPrice: number;

    @Column({ nullable: true })
    expCode: string;

    @Column({ default: 'default.jpg' })
    expImage: string;

    @Column({ default: false })
    expTermsConditionIsEnabled: boolean;

    @Column({ nullable: true })
    expTermsAndConditions: string;

    @Column({ default: false })
    expIsRegistrationEnabled: boolean;

    @Column({ default: false })
    expIsSeatsUnlimited: boolean;

    @Column({ default: 0 })
    expMinSeats: number;

    @Column({ default: 0 })
    expMaxSeats: number;
    
    @Column({ type: 'enum', enum: RegType, default: RegType.IMMEDIATE })
    expRegistrationStartType: RegType;

    @CreateDateColumn({ nullable: true })
    expRegistrationStartDate: Date;

    @Column({ type: 'int', default: 0 })
    expRegistrationStartBefore: number;

    @Column({ type: 'enum', enum: RegType, default: RegType.IMMEDIATE })
    expRegistrationEndType: RegType;

    @CreateDateColumn({ nullable: true })
    expRegistrationEndDate: Date;

    @Column({ type: 'int', default: 0 })
    expRegistrationEndBefore: number;

    @Column({ type: 'uuid', nullable: true })
    expCreatedBy: string;

    @Column({ default: true })
    expStatus: boolean;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
  
    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}
