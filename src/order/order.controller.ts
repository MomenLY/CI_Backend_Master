import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { Order } from './entities/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(@Query() searchOrderDto: SearchOrderDto): Promise<{ data: OrderDto[]; total: number }> {
    return await this.orderService.findAll(searchOrderDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.orderService.create(createOrderDto as Order, req);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(_id, updateOrderDto as Order);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
