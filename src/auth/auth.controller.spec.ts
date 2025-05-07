import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UsersService, 
        AuthService, 
        JwtService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    const mockSignIn = { access_token: "asdfasdffasdfsdf" };
    const mockEmail = 'test@example.com';
    const mockPassword = 'password';
    const mockSignInDto: any = { email: mockEmail, password: mockPassword };

    it('should return the user after successful sign in', async () => {
      jest.spyOn(service, 'signIn').mockResolvedValue(mockSignIn);

      const result = await controller.signIn(mockSignInDto);

      expect(result).toBe(mockSignIn);
      expect(service.signIn).toHaveBeenCalledWith(mockEmail, mockPassword);
    });
  });
});