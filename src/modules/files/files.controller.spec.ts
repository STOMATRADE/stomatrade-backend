import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('FilesController', () => {
    let controller: FilesController;
    let service: FilesService;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByReffId: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    const mockFile = { id: 'file-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FilesController],
            providers: [{ provide: FilesService, useValue: mockService }],
        }).compile();

        controller = module.get<FilesController>(FilesController);
        service = module.get<FilesService>(FilesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create file', async () => {
            const dto = new CreateFileDto();
            mockService.create.mockResolvedValue(mockFile);
            expect(await controller.create(dto)).toEqual(mockFile);
        });
    });

    describe('findAll', () => {
        it('should return files', async () => {
            mockService.findAll.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAll(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });
});
