import { Test, TestingModule } from '@nestjs/testing';
import { ProfileFieldsService } from './profileFields.service';

describe('ProfileFieldsService', () => {
  let service: ProfileFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileFieldsService],
    }).compile();

    service = module.get<ProfileFieldsService>(ProfileFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
