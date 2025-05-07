import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { ErrorMessages, SuccessMessages } from 'src/utils/messages';
import { isObjectIdOrUUID } from 'src/utils/helper';

@Injectable()
export class CategoriesService {
  private Category: Repository<Category>;
  constructor(@Inject(TENANT_CONNECTION) private connection) {
    this.Category = this.connection.getRepository(Category);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.cParentId) {
      if (!isObjectIdOrUUID(createCategoryDto.cParentId)) {
        throw new BadRequestException(
          ErrorMessages.INVALID_UUID_FORMAT +
            `: ${createCategoryDto.cParentId}`,
        );
      }
      const categoryData = await this.Category.findOneBy({
        _id: createCategoryDto.cParentId,
      });
      if (!categoryData) {
        throw new NotFoundException(
          ErrorMessages.CATEGORY_DATA_NOT_FOUND +
            `with ID ${createCategoryDto.cParentId}`,
        );
      } else {
        return this.Category.save(createCategoryDto);
      }
    }
    return this.Category.save(createCategoryDto);
  }

  findAll() {
    return this.Category.find();
  }

  async findOne(id: string) {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const categoryData = await this.Category.findOneBy({ _id: id });
    if (!categoryData) {
      throw new NotFoundException(
        ErrorMessages.CATEGORY_DATA_NOT_FOUND + `with ID ${id}`,
      );
    }

    return categoryData;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const categoryData = await this.Category.findOneBy({ _id: id });
    if (!categoryData) {
      throw new NotFoundException(
        ErrorMessages.CATEGORY_DATA_NOT_FOUND + `with ID ${id}`,
      );
    }

    if (updateCategoryDto.cParentId === id) {
      throw new BadRequestException(ErrorMessages.CPARENTID_NOT_SAME);
    }

    if (updateCategoryDto.cParentId) {
      if (!isObjectIdOrUUID(updateCategoryDto.cParentId)) {
        throw new BadRequestException(
          ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
        );
      }
      const parentCategory = await this.Category.findOneBy({
        _id: updateCategoryDto.cParentId,
      });
      if (!parentCategory) {
        throw new BadRequestException(
          ErrorMessages.CPARENT_NOT_VALID_PARENT_CATEGORY,
        );
      }
    }

    try {
      const updatedCategoryData = this.Category.merge(
        categoryData,
        updateCategoryDto,
      );
      return this.Category.save(updatedCategoryData);
    } catch (error) {
      if (error) {
        throw new BadRequestException(
          Object.values(error.constraints).join(', '),
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    if (!isObjectIdOrUUID(id)) {
      throw new BadRequestException(
        ErrorMessages.INVALID_UUID_FORMAT + `: ${id}`,
      );
    }
    const categoryData = await this.Category.findOneBy({ _id: id });
    if (!categoryData) {
      throw new NotFoundException(
        ErrorMessages.MASTERDATA_NOT_FOUND + ` ${id}`,
      );
    }
    await this.Category.remove(categoryData);
    return SuccessMessages.RECORD_DELETION_SUCCESS;
  }
}
