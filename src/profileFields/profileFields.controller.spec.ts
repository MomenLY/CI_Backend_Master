import { Test, TestingModule } from '@nestjs/testing';
import { ProfileFieldsController } from './profileFields.controller';
import { ProfileFieldsService } from './profileFields.service';

describe('ProfileFieldsController', () => {
  let controller: ProfileFieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileFieldsController],
      providers: [ProfileFieldsService],
    }).compile();

    controller = module.get<ProfileFieldsController>(ProfileFieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
