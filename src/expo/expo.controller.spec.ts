import { Test, TestingModule } from '@nestjs/testing';
import { ExpoController } from './expo.controller';
import { ExpoService } from './expo.service';

describe('ExpoController', () => {
  let controller: ExpoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpoController],
      providers: [ExpoService],
    }).compile();

    controller = module.get<ExpoController>(ExpoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
