import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateChannelNotificationDto } from './dto/create-channel-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let service: NotificationsService;

    const mockService = {
        createChannel: jest.fn(),
        findAllChannels: jest.fn(),
        findOneChannel: jest.fn(),
        removeChannel: jest.fn(),
        createNotification: jest.fn(),
        findAllNotifications: jest.fn(),
        findOneNotification: jest.fn(),
        removeNotification: jest.fn(),
        createTokenNotification: jest.fn(),
        findTokenNotificationsByUser: jest.fn(),
        removeTokenNotification: jest.fn(),
    };

    const mockChannel = { id: 'channel-id' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [{ provide: NotificationsService, useValue: mockService }],
        }).compile();

        controller = module.get<NotificationsController>(NotificationsController);
        service = module.get<NotificationsService>(NotificationsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createChannel', () => {
        it('should create channel', async () => {
            const dto = new CreateChannelNotificationDto();
            mockService.createChannel.mockResolvedValue(mockChannel);
            expect(await controller.createChannel(dto)).toEqual(mockChannel);
        });
    });

    describe('findAllChannels', () => {
        it('should return channels', async () => {
            mockService.findAllChannels.mockResolvedValue({ items: [], meta: {} });
            expect(await controller.findAllChannels(new PaginationDto())).toEqual({ items: [], meta: {} });
        });
    });
});
