import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ethers } from 'ethers';

/**
 * Guard to verify that the authenticated user owns the wallet address
 * in the request (for operations that require wallet ownership)
 */
@Injectable()
export class WalletAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;
    const params = request.params;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if wallet address in body matches authenticated user
    const walletInBody = body?.walletAddress?.toLowerCase();
    const walletInParams = params?.walletAddress?.toLowerCase();
    const userWallet = user.walletAddress?.toLowerCase();

    if (walletInBody && walletInBody !== userWallet) {
      // Admin can bypass this check
      if (user.role !== 'ADMIN') {
        throw new UnauthorizedException(
          'You can only perform this action for your own wallet',
        );
      }
    }

    if (walletInParams && walletInParams !== userWallet) {
      if (user.role !== 'ADMIN') {
        throw new UnauthorizedException(
          'You can only perform this action for your own wallet',
        );
      }
    }

    return true;
  }
}

