import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsArray,
    IsJSON,
    ValidateNested
  } from 'class-validator';
  import { EoOrderStatus, EoPaymentMode, Order } from '../entities/order.entity';
  import { Type } from 'class-transformer';
  
  export class CreateOrderDto {
    @IsUUID()
    @IsNotEmpty()
    eoOrderId: string;
  
    @IsUUID()
    @IsNotEmpty()
    eoUserId: string;
  
    @IsJSON()
    @IsOptional()
    eoItemDetails: any;
  
    @IsEnum(EoOrderStatus)
    @IsOptional()
    eoOrderStatus: EoOrderStatus;
  
    @IsString()
    @IsOptional()
    eoTransactionId: string;
  
    @IsJSON()
    @IsOptional()
    eoPaymentResponse: any;
  
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    eoLog: string[];
  
    @IsEnum(EoPaymentMode)
    @IsNotEmpty()
    eoPaymentMode: EoPaymentMode;
  
    // @IsUUID()
    // @IsNotEmpty()
    // eoCreatedBy: string;
  }
  
  export class OrderDto {
    id: string;
  
    @IsUUID()
    @IsNotEmpty()
    eoOrderId: string;
  
    @IsUUID()
    @IsNotEmpty()
    eoUserId: string;
  
    @IsJSON()
    @IsOptional()
    eoItemDetails: any;
  
    @IsEnum(EoOrderStatus)
    @IsOptional()
    eoOrderStatus: EoOrderStatus;
  
    @IsString()
    @IsOptional()
    eoTransactionId: string;
  
    @IsJSON()
    @IsOptional()
    eoPaymentResponse: any;
  
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    eoLog: string[];
  
    @IsEnum(EoPaymentMode)
    @IsNotEmpty()
    eoPaymentMode: EoPaymentMode;
  
    constructor(order?: Partial<Order>) {
      if (order) {
        this.eoOrderId = order.eoOrderId;
        this.eoUserId = order.eoUserId;
        this.eoItemDetails = order.eoItemDetails;
        this.eoOrderStatus = order.eoOrderStatus;
        this.eoTransactionId = order.eoTransactionId;
        this.eoPaymentResponse = order.eoPaymentResponse;
        this.eoLog = order.eoLog;
        this.eoPaymentMode = order.eoPaymentMode;
      }
    }
  }