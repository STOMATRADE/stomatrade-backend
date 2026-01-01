import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RequestNonceDto } from './dto/request-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ROLES } from '@prisma/client';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    const mockService = {
        requestNonce: jest.fn(),
        verifySignature: jest.fn(),
        registerUser: jest.fn(),
        getProfile: jest.fn(),
        refreshToken: jest.fn(),
    };

    const mockUser = {
        id: 'user-id-1',
        walletAddress: '0xAddress',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('requestNonce', () => {
        it('should request nonce', async () => {
            const dto: RequestNonceDto = { walletAddress: '0xAddress' };
            mockService.requestNonce.mockResolvedValue({ nonce: '123' });
            const result = await controller.requestNonce(dto);
            expect(service.requestNonce).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ nonce: '123' });
        });
    });

    describe('verifySignature', () => {
        it('should verify signature', async () => {
            const dto: VerifySignatureDto = {
                walletAddress: '0xAddress',
                signature: '0xSig',
            };
            mockService.verifySignature.mockResolvedValue({ accessToken: 'token' });
            const result = await controller.verifySignature(dto);
            expect(service.verifySignature).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ accessToken: 'token' });
        });
    });

    describe('registerUser', () => {
        it('should register user', async () => {
            const dto: RegisterUserDto = {
                walletAddress: '0xAddress',
                role: ROLES.INVESTOR,
            };
            mockService.registerUser.mockResolvedValue(mockUser);
            const result = await controller.registerUser(dto);
            expect(service.registerUser).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('getProfile', () => {
        it('should return profile', async () => {
            const req = { user: { sub: 'user-id' } };
            mockService.getProfile.mockResolvedValue(mockUser);
            const result = await controller.getProfile(req);
            expect(service.getProfile).toHaveBeenCalledWith('user-id');
            expect(result).toEqual(mockUser);
        });
    });

    describe('refreshToken', () => {
        it('should give new token', async () => {
            const req = { user: { sub: 'user-id' } };
            mockService.refreshToken.mockResolvedValue({ accessToken: 'new-token' });
            const result = await controller.refreshToken(req);
            expect(service.refreshToken).toHaveBeenCalledWith('user-id');
            expect(result).toEqual({ accessToken: 'new-token' });
        });
    });
});
