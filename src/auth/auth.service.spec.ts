import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from '@node-rs/bcrypt';
const saltRounds = 10;
describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: JwtService;
  let bcryptInstance: any;

  beforeEach(async () => {
    bcryptInstance = {
      compare: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(async () => ({
              _id: '123',
              firstName: 'John',
              lastName: 'Doe',
              password: await bcrypt.hash('password', saltRounds),
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => 'fake_token'),
          },
        },
        {
          provide: bcrypt as any,
          useValue: bcryptInstance,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return a token when signing in with correct credentials', async () => {
    const result = await service.signIn('test@example.com', 'password');
    expect(result).toEqual({ access_token: 'fake_token' });
  });

  it('should throw an error when signing in with incorrect password', async () => {
    bcryptInstance.compare.mockReturnValue(false);
    try {
      await service.signIn('test@example.com', 'wrong_password');
    } catch (error) {
      expect(error.message).toEqual('Invalid password');
    }
  });

  it('should throw an error when signing in with non-existing user', async () => {
    usersService.findOneByEmail.mockReturnValue(null);
    try {
      await service.signIn('test@example.com', 'password');
    } catch (error) {
      expect(error.message).toEqual('User does not exist');
    }
  });
});