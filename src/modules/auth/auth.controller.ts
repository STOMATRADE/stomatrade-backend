import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestNonceDto } from './dto/request-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { ROLES } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('nonce')
  @ApiOperation({
    summary: 'Request authentication nonce',
    description: 'Get a nonce to sign with your wallet for authentication',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nonce generated successfully',
    schema: {
      properties: {
        nonce: { type: 'string', example: '123456' },
        message: { type: 'string', example: 'Welcome to StoMaTrade!...' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid wallet address',
  })
  requestNonce(@Body() dto: RequestNonceDto) {
    return this.authService.requestNonce(dto);
  }

  @Public()
  @Post('verify')
  @ApiOperation({
    summary: 'Verify wallet signature and authenticate',
    description: 'Submit signed message to authenticate and receive JWT token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentication successful',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            walletAddress: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid signature or expired nonce',
  })
  verifySignature(@Body() dto: VerifySignatureDto) {
    return this.authService.verifySignature(dto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register new user with role (Admin only)',
    description: 'Create a new user account with specific role',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve authenticated user profile with related data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh JWT token',
    description: 'Get a new JWT token using existing valid token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.sub);
  }
}

