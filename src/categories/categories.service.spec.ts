import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto = {
        cName: 'Test Category',
        cOrder: 1,
        cParentId: 0,
        cStatus: true,
      };

      categoryRepository.save.toHaveBeenCalledWith(createCategoryDto);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(createCategoryDto);

      expect(categoryRepository.save).toHaveBeenCalledWith(createCategoryDto);
    });

    it('should throw BadRequestException if a required field is missing', async () => {
      const createCategoryDto = {
        cName: 'Test Category',
        cOrder: 1,
        cParentId: 0,
        cStatus: true,
      };

      await expect(service.create(createCategoryDto)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if a field contains an unexpected value', async () => {
      const createCategoryDto = {
        cName: 'Test Category',
        cOrder: 1,
        cParentId: 0,
        cStatus: true,
      };

      await expect(service.create(createCategoryDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });
});
