import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ROLES } from '@prisma/client';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockUser = {
        id: 'user-id-1',
        walletAddress: '0xAddress',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create user', async () => {
            const dto: CreateUserDto = { walletAddress: '0xAddress', role: ROLES.INVESTOR };
            mockService.create.mockResolvedValue(mockUser);
            const result = await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('findAll', () => {
        it('should return users', async () => {
            const pagination = new PaginationDto();
            mockService.findAll.mockResolvedValue({ items: [mockUser], meta: {} });
            const result = await controller.findAll(pagination);
            expect(service.findAll).toHaveBeenCalledWith(pagination);
            expect(result.items).toContain(mockUser);
        });
    });

    describe('findOne', () => {
        it('should return user', async () => {
            mockService.findOne.mockResolvedValue(mockUser);
            const result = await controller.findOne('user-id');
            expect(service.findOne).toHaveBeenCalledWith('user-id');
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        it('should update user', async () => {
            const dto = new UpdateUserDto();
            mockService.update.mockResolvedValue(mockUser);
            const result = await controller.update('user-id', dto);
            expect(service.update).toHaveBeenCalledWith('user-id', dto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('remove', () => {
        it('should remove user', async () => {
            mockService.remove.mockResolvedValue(mockUser);
            const result = await controller.remove('user-id');
            expect(service.remove).toHaveBeenCalledWith('user-id');
            expect(result).toEqual(mockUser);
        });
    });
});
