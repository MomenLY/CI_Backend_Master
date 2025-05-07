import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createRoleDto = { name: 'admin', acl: { users: { viewUsers: { permission: true } } } };
      const role = new Role();
      role.name = createRoleDto.name;
      role.acl = JSON.stringify(createRoleDto.acl);

      jest.spyOn(roleRepository, 'save').mockResolvedValue(role);

      const result = await service.create(createRoleDto);

      expect(result).toEqual(role);
      expect(roleRepository.save).toHaveBeenCalledWith(role);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [new Role(), new Role()];
      jest.spyOn(roleRepository, 'find').mockResolvedValue(roles);

      const result = await service.findAll();

      expect(result).toEqual(roles);
      expect(roleRepository.find).toHaveBeenCalled();
    });
  });

  // describe('findByIds', () => {
  //   it('should return roles by ids', async () => {
  //     const ids = [new ObjectId().toString('hex'), new ObjectId().toString('hex')];
  //     const roles = [new Role(), new Role()];
  //     jest.spyOn(roleRepository, 'findByIds').mockResolvedValue(roles);

  //     const result = await service.findByIds(ids);

  //     expect(result).toEqual(roles);
  //     expect(roleRepository.findByIds).toHaveBeenCalledWith(ids);
  //   });
  // });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const id = '1';
      const role = new Role();
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(role);

      const result = await service.findOne(id);

      expect(result).toEqual(role);
      expect(roleRepository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if role not found', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(roleRepository.findOne).toHaveBeenCalledWith('1');
    });
  });
});