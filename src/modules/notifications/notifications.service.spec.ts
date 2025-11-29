import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../test/mocks/prisma.mock';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: typeof mockPrismaService;

  const mockChannel = {
    id: 'channel-uuid-1',
    key: 'project_updates',
    desc: 'Channel for project updates',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  const mockNotification = {
    id: 'notification-uuid-1',
    channelId: 'channel-uuid-1',
    title: 'New Project',
    body: 'A new project is available',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  const mockTokenNotification = {
    id: 'token-uuid-1',
    userId: 'user-uuid-1',
    tokenId: 'fcm_token_abc123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Channel Notifications', () => {
    describe('createChannel', () => {
      it('should create a channel', async () => {
        const createDto = {
          key: 'project_updates',
          desc: 'Channel for project updates',
        };

        prisma.channelNotification.create.mockResolvedValue(mockChannel);

        const result = await service.createChannel(createDto);

        expect(prisma.channelNotification.create).toHaveBeenCalled();
        expect(result).toEqual(mockChannel);
      });
    });

    describe('findAllChannels', () => {
      it('should return paginated channels', async () => {
        prisma.channelNotification.findMany.mockResolvedValue([mockChannel]);
        prisma.channelNotification.count.mockResolvedValue(1);

        const result = await service.findAllChannels({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(1);
      });
    });

    describe('findOneChannel', () => {
      it('should return a channel by id', async () => {
        prisma.channelNotification.findUnique.mockResolvedValue(mockChannel);

        const result = await service.findOneChannel('channel-uuid-1');

        expect(result).toEqual(mockChannel);
      });

      it('should throw NotFoundException if not found', async () => {
        prisma.channelNotification.findUnique.mockResolvedValue(null);

        await expect(service.findOneChannel('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeChannel', () => {
      it('should soft delete a channel', async () => {
        const deleted = { ...mockChannel, deleted: true };

        prisma.channelNotification.findUnique.mockResolvedValue(mockChannel);
        prisma.channelNotification.update.mockResolvedValue(deleted);

        const result = await service.removeChannel('channel-uuid-1');

        expect(result.deleted).toBe(true);
      });
    });
  });

  describe('Notifications', () => {
    describe('createNotification', () => {
      it('should create a notification', async () => {
        const createDto = {
          channelId: 'channel-uuid-1',
          title: 'New Project',
          body: 'A new project is available',
        };

        prisma.notification.create.mockResolvedValue(mockNotification);

        const result = await service.createNotification(createDto);

        expect(prisma.notification.create).toHaveBeenCalled();
        expect(result).toEqual(mockNotification);
      });
    });

    describe('findAllNotifications', () => {
      it('should return paginated notifications', async () => {
        prisma.notification.findMany.mockResolvedValue([mockNotification]);
        prisma.notification.count.mockResolvedValue(1);

        const result = await service.findAllNotifications({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(1);
      });
    });

    describe('findOneNotification', () => {
      it('should return a notification by id', async () => {
        prisma.notification.findUnique.mockResolvedValue(mockNotification);

        const result = await service.findOneNotification('notification-uuid-1');

        expect(result).toEqual(mockNotification);
      });
    });

    describe('removeNotification', () => {
      it('should soft delete a notification', async () => {
        const deleted = { ...mockNotification, deleted: true };

        prisma.notification.findUnique.mockResolvedValue(mockNotification);
        prisma.notification.update.mockResolvedValue(deleted);

        const result = await service.removeNotification('notification-uuid-1');

        expect(result.deleted).toBe(true);
      });
    });
  });

  describe('Token Notifications', () => {
    describe('createTokenNotification', () => {
      it('should create a token notification', async () => {
        const createDto = {
          userId: 'user-uuid-1',
          tokenId: 'fcm_token_abc123',
        };

        prisma.tokenNotification.create.mockResolvedValue(mockTokenNotification);

        const result = await service.createTokenNotification(createDto);

        expect(prisma.tokenNotification.create).toHaveBeenCalled();
        expect(result).toEqual(mockTokenNotification);
      });
    });

    describe('findTokenNotificationsByUser', () => {
      it('should return token notifications by user', async () => {
        prisma.tokenNotification.findMany.mockResolvedValue([mockTokenNotification]);
        prisma.tokenNotification.count.mockResolvedValue(1);

        const result = await service.findTokenNotificationsByUser('user-uuid-1', {
          page: 1,
          limit: 10,
        });

        expect(result.items).toHaveLength(1);
      });
    });

    describe('removeTokenNotification', () => {
      it('should soft delete a token notification', async () => {
        const deleted = { ...mockTokenNotification, deleted: true };

        prisma.tokenNotification.findUnique.mockResolvedValue(mockTokenNotification);
        prisma.tokenNotification.update.mockResolvedValue(deleted);

        const result = await service.removeTokenNotification('token-uuid-1');

        expect(result.deleted).toBe(true);
      });
    });
  });
});

