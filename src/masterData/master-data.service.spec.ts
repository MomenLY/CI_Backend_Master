import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MasterDataService } from './master-data.service';
import { MasterData } from './entities/master-data.entity';
import { Repository } from 'typeorm';
import { CreateMasterDataDto } from './dto/create-master-data.dto';
import { UpdateMasterDataDto } from './dto/update-master-data.dto';

describe('MasterDataService', () => {
  let service: MasterDataService;
  let repository: Repository<MasterData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterDataService,
        {
          provide: getRepositoryToken(MasterData),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MasterDataService>(MasterDataService);
    repository = module.get<Repository<MasterData>>(getRepositoryToken(MasterData));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new MasterData', async () => {
      const createMasterDataDto: CreateMasterDataDto = {
        mDName:"Name",
        mDDataCollections: {
          sunday:"Funday"
        }
      };
      const savedMasterData = new MasterData();
      jest.spyOn(repository, 'create').mockReturnValue(savedMasterData);
      jest.spyOn(repository, 'save').mockResolvedValue(savedMasterData);

      const result = await service.create(createMasterDataDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createMasterDataDto,
        mDKey: expect.any(String),
      });
      expect(repository.save).toHaveBeenCalledWith(savedMasterData);
      expect(result).toEqual(savedMasterData);
    });
  });

  // // Add more test cases for other methods
  // describe('findAll', () => {
  //   // ...
  // });

  // describe('findOne', () => {
  //   // ...
  // });

  // describe('update', () => {
  //   // ...
  // });

  // describe('batchUpdate', () => {
  //   // ...
  // });

  // describe('remove', () => {
  //   // ...
  // });
});