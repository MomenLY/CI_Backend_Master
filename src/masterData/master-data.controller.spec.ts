import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { CreateMasterDataDto } from './dto/create-master-data.dto';
import { UpdateMasterDataDto } from './dto/update-master-data.dto';

describe('MasterDataController', () => {
  let controller: MasterDataController;
  let service: MasterDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterDataController],
      providers: [
        {
          provide: MasterDataService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            batchUpdate: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MasterDataController>(MasterDataController);
    service = module.get<MasterDataService>(MasterDataService);
  });

  describe('create', () => {
    it('should call the service create method', () => {
      const createMasterDataDto: CreateMasterDataDto = {
        mDName:"Name",
        mDDataCollections: {
          sun:"dun"
        }
      };
      controller.create(createMasterDataDto);
      expect(service.create).toHaveBeenCalledWith(createMasterDataDto);
    });
    
  });

  describe('findAll', () => {
    it('should call the service findAll method', () => {
      controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call the service findOne method', () => {
      const id = '1';
      controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call the service update method', () => {
      const id = '1';
      const updateMasterDataDto: UpdateMasterDataDto = {
        mDName: "name",
        mDDataCollections: {
          fun: "sun",
        }
      };
      controller.update(id, updateMasterDataDto);
      expect(service.update).toHaveBeenCalledWith(id, updateMasterDataDto);
    });
  });

  describe('batchUpdate', () => {
    it('should call the service batchUpdate method', () => {
      const updateMasterDataDto: UpdateMasterDataDto[] = [
        // provide test data
        {
          _id: "fdsfsdfsd",
          mDName: "name",
          mDDataCollections: {
            fun: "sun",
          }
        },
        {
          _id:"sfdfsfsd",
          mDName: "name",
          mDDataCollections: {
            fun: "sun",
          }
        }
      ];
      controller.batchUpdate(updateMasterDataDto);
      expect(service.batchUpdate).toHaveBeenCalledWith(updateMasterDataDto);
    });
  });

  describe('remove', () => {
    it('should call the service remove method', () => {
      const id = '1';
      controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
})