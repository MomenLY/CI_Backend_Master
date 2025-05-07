import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, OrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { DeleteResult, FindManyOptions, FindOptionsWhere, ILike, MongoRepository, Repository } from 'typeorm';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { SearchOrderDto } from './dto/search-order.dto';
import { isObjectIdOrUUID } from 'src/utils/helper';
import { ErrorMessages } from 'src/utils/messages';

@Injectable()
export class OrderService {

  private orderRepository: Repository<Order> & MongoRepository<Order>

  constructor(
    @Inject(TENANT_CONNECTION) private connection,
  ) {
    this.orderRepository = this.connection.getRepository(Order)
  }
  async findAll(searchOrderDto: SearchOrderDto): Promise<{ data: OrderDto[]; total: number }> {
    const { orderId, page, limit, sortColumn = 'eoCreatedAt', sortOrder = 'ASC' } = searchOrderDto;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order> = {};

    if (orderId) {
      where.eoOrderId = ILike(`%${orderId}%`);
    }


    const order: FindManyOptions<Order>['order'] = {
      [sortColumn]: sortOrder.toUpperCase(),
    };

    const [result, total] = await this.orderRepository.findAndCount({
      where,
      take: limit,
      skip,
      order,
    });
    return {
      data: result.map(order => new OrderDto(order)),
      total,
    };
  }

  async findOne(id: string): Promise<Order> {
    // try{
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(ErrorMessages.INVALID_UUID_FORMAT);
    }
    try {
      const response = await this.orderRepository.findOneBy({ id });
      console.log(response, "res");
      if (!response || response === null) {
        throw new Error("Order not found");
      }
      return response;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new NotFoundException(err.message);
      }
    }   
  }

  create(order: Order, request: any): Promise<Order> {
    order.eoCreatedBy = request.user._id;
    return this.orderRepository.save(order);
  }

  async update(id: string, order: Order): Promise<Order> {
    await this.orderRepository.update(id, order);
    return this.orderRepository.findOneBy({ _id: id });
  }

  async remove(id: string): Promise<DeleteResult> {
    const response = await this.orderRepository.delete(id);
    return response;
  }
}
