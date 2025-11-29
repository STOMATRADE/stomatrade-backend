/**
 * Mock JWT Service for unit testing
 */

export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({
    sub: 'user-uuid',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
    role: 'INVESTOR',
  }),
  verifyAsync: jest.fn().mockResolvedValue({
    sub: 'user-uuid',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
    role: 'INVESTOR',
  }),
  decode: jest.fn().mockReturnValue({
    sub: 'user-uuid',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
    role: 'INVESTOR',
  }),
};

export const createMockJwtService = () => ({ ...mockJwtService });

