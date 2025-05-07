import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
  } from "typeorm";
  

  export enum EoOrderStatus {
    INVOICE_GENERATED = 'invoiceGenerated',
    PAYMENT_PROGRESS = 'paymentProgress',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
  }

  export enum EoPaymentMode {
    INVOICE = 'invoice',
    FREE = 'free',
    CARD = 'card'
  }
  const databaseType = process.env.DB_TYPE || 'postgres';
  
  @Entity({ database: databaseType })
  export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', unique: true })
    eoOrderId: string;
  
    @Column({ type: 'uuid' })
    eoUserId: string;
  
    @Column('json')
    eoItemDetails: any;
  
    @Column({
      type: 'enum',
      enum: EoOrderStatus,
      default: EoOrderStatus.PAYMENT_PROGRESS
    })
    eoOrderStatus: EoOrderStatus;
  
    @Column({ type: 'varchar', nullable: true })
    eoTransactionId: string;
  
    @Column('json')
    eoPaymentResponse: any;
  
    @Column('simple-array')
    eoLog: string[];
  
    @Column({
      type: 'enum',
      enum: EoPaymentMode,
      default: EoPaymentMode.INVOICE
    })
    eoPaymentMode: EoPaymentMode;
  
    @Column({ type: 'uuid' })
    eoCreatedBy: string;
  
    @CreateDateColumn()
    eoCreatedAt: Date;
  
    @UpdateDateColumn()
    eoUpdatedAt: Date;
  }
  