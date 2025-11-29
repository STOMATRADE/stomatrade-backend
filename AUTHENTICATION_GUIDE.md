# StoMaTrade Authentication & Authorization Guide

## 📋 Overview

StoMaTrade menggunakan **wallet-based authentication** dengan **JWT (JSON Web Tokens)** untuk mengamankan API endpoints. Sistem ini mendukung signature verification menggunakan Ethereum wallets (MetaMask, WalletConnect, dll) dan mendukung baik **EOA (Externally Owned Account)** maupun **Smart Wallet (EIP-1271)**.

### Tech Stack
- **Strategy**: Passport JWT
- **Guards**: JWT Authentication + Role-Based Access Control (RBAC)
- **Signature Verification**: Ethers.js v6
- **Token Expiry**: Configurable (default: 7 days)

---

## 🔐 Authentication Flow

### 1. **Wallet-Based Login Flow (Recommended)**

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Wallet
    participant Database

    Client->>API: POST /auth/verify { walletAddress, message, signature }
    API->>API: Verify signature with ethers.js
    API->>Database: Find or create user
    Database-->>API: User data
    API->>API: Generate JWT token
    API-->>Client: { accessToken, user }
    Client->>API: Subsequent requests with Authorization: Bearer <token>
```

**Step-by-step:**

1. **Client generates timestamp message:**
   ```javascript
   const message = `Login StoMaTrade: ${new Date().toISOString()}`;
   ```

2. **Client signs message with wallet:**
   ```javascript
   // Using ethers.js
   const signature = await signer.signMessage(message);

   // Or using MetaMask
   const signature = await ethereum.request({
     method: 'personal_sign',
     params: [message, walletAddress]
   });
   ```

3. **Client sends to backend:**
   ```bash
   POST /auth/verify
   {
     "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     "message": "Login StoMaTrade: 2025-11-29T10:30:00.000Z",
     "signature": "0xabc123..."
   }
   ```

4. **Backend verifies and returns JWT:**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid",
       "walletAddress": "0x742d35...",
       "role": "INVESTOR"
     }
   }
   ```

5. **Client uses token in subsequent requests:**
   ```bash
   GET /users
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 2. **Nonce-Based Login Flow (Legacy)**

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Wallet
    participant Database

    Client->>API: POST /auth/nonce { walletAddress }
    API-->>Client: { nonce, message }
    Client->>Wallet: Sign message
    Wallet-->>Client: signature
    Client->>API: POST /auth/verify { walletAddress, signature }
    API->>API: Verify signature
    API->>Database: Find or create user
    API-->>Client: { accessToken, user }
```

**Example:**

```bash
# Step 1: Request nonce
POST /auth/nonce
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}

# Response:
{
  "nonce": "123456",
  "message": "Welcome to StoMaTrade!\n\nPlease sign this message to authenticate.\n\nWallet: 0x742d35...\nNonce: 123456\n\nThis signature will not cost you any gas fees."
}

# Step 2: Sign message with wallet, then verify
POST /auth/verify
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0xabc123..."
}
```

---

## 🛡️ Authorization (Role-Based Access Control)

### Available Roles

```typescript
enum ROLES {
  ADMIN       // Full access to all endpoints
  STAFF       // Access to operational endpoints
  INVESTOR    // Access to investment-related endpoints
  COLLECTOR   // Access to farmer/project management
}
```

### Role Hierarchy

```
ADMIN > STAFF > COLLECTOR > INVESTOR
```

---

## 📌 Guards & Decorators

### 1. **JwtAuthGuard** - JWT Verification

Memverifikasi bahwa request memiliki JWT token yang valid.

```typescript
// Automatically applied globally - no need to add manually
// To bypass, use @Public() decorator
```

### 2. **RolesGuard** - Role Verification

Memverifikasi bahwa user memiliki role yang sesuai.

```typescript
@Roles(ROLES.ADMIN)
@Post('create-admin-only')
createAdminOnly() {
  // Only accessible by ADMIN
}

@Roles(ROLES.ADMIN, ROLES.STAFF)
@Get('staff-access')
getStaffData() {
  // Accessible by ADMIN or STAFF
}
```

### 3. **WalletAuthGuard** - Wallet Ownership Verification

Memverifikasi bahwa authenticated user adalah pemilik wallet address yang diminta.

```typescript
@UseGuards(WalletAuthGuard)
@Post('my-wallet-action')
myWalletAction(@Body() dto: { walletAddress: string }) {
  // User can only perform action for their own wallet
  // Admin can bypass this check
}
```

### 4. **@Public()** - Bypass Authentication

Menandai endpoint sebagai public (tidak perlu authentication).

```typescript
@Public()
@Get('public-projects')
getPublicProjects() {
  // No authentication required
}
```

### 5. **@CurrentUser()** - Get Authenticated User

Mengambil data user dari JWT payload.

```typescript
@Get('my-profile')
getMyProfile(@CurrentUser() user: JwtPayload) {
  // user = { sub: userId, walletAddress, role }
  return this.service.findOne(user.sub);
}

// Or get specific field
@Get('my-wallet')
getMyWallet(@CurrentUser('walletAddress') wallet: string) {
  return { wallet };
}
```

---

## 🔧 Implementation Examples

### Example 1: Protected Controller (All Endpoints Require Auth)

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '@prisma/client';

@ApiBearerAuth('JWT-auth')
@Controller('investments')
export class InvestmentsController {

  // All authenticated users can access
  @Get('my-investments')
  getMyInvestments(@CurrentUser('sub') userId: string) {
    return this.service.findByUser(userId);
  }

  // Only investors can invest
  @Roles(ROLES.INVESTOR)
  @Post()
  createInvestment(@CurrentUser('sub') userId: string, @Body() dto: any) {
    return this.service.create(userId, dto);
  }

  // Only admin can see all investments
  @Roles(ROLES.ADMIN)
  @Get('all')
  getAllInvestments() {
    return this.service.findAll();
  }
}
```

### Example 2: Mixed Public/Private Endpoints

```typescript
import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {

  // Public - anyone can view
  @Public()
  @Get()
  getAllProjects() {
    return this.service.findAll();
  }

  // Public - anyone can view
  @Public()
  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Protected - only collectors/staff/admin can create
  @Roles(ROLES.COLLECTOR, ROLES.STAFF, ROLES.ADMIN)
  @Post()
  createProject(@Body() dto: any) {
    return this.service.create(dto);
  }

  // Protected - only staff/admin can update
  @Roles(ROLES.STAFF, ROLES.ADMIN)
  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  // Protected - only admin can delete
  @Roles(ROLES.ADMIN)
  @Delete(':id')
  deleteProject(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### Example 3: Wallet Ownership Verification

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WalletAuthGuard } from '../auth/guards/wallet-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('farmers')
export class FarmersController {

  @UseGuards(WalletAuthGuard)
  @Post('submit-for-minting')
  submitForMinting(
    @CurrentUser('walletAddress') userWallet: string,
    @Body() dto: { walletAddress: string, farmerId: string }
  ) {
    // WalletAuthGuard ensures dto.walletAddress === userWallet
    // (unless user is ADMIN)
    return this.service.submitForMinting(dto);
  }
}
```

---

## 🌐 Global Configuration

Global guards sudah diaktifkan di `app.module.ts`:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Applied to all endpoints
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Applied to all endpoints
    },
  ],
})
export class AppModule {}
```

**Artinya:**
- Semua endpoint **secara default** memerlukan authentication
- Gunakan `@Public()` untuk endpoint yang tidak perlu authentication
- Gunakan `@Roles()` untuk membatasi akses berdasarkan role

---

## ⚙️ Environment Configuration

Tambahkan ke `.env`:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Blockchain RPC (for smart wallet signature verification)
BLOCKCHAIN_RPC_URL=https://rpc.sepolia-api.lisk.com
```

---

## 🧪 Testing with Swagger

### 1. Authenticate First

```bash
POST /auth/verify
{
  "walletAddress": "0x...",
  "message": "Login StoMaTrade: 2025-11-29T10:00:00.000Z",
  "signature": "0x..."
}
```

### 2. Copy Access Token

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Click "Authorize" in Swagger

- Masukkan token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click "Authorize"

### 4. Test Protected Endpoints

Semua request sekarang akan menyertakan header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔒 Security Best Practices

### 1. **Signature Expiry**

Message harus berisi timestamp dan akan expired dalam 60 detik:

```typescript
// Client-side
const message = `Login StoMaTrade: ${new Date().toISOString()}`;

// Backend akan reject jika > 60 detik
if (Date.now() - timestamp > 60000) {
  throw new UnauthorizedException('Signature expired');
}
```

### 2. **JWT Token Security**

```bash
# Use strong secret (min 32 characters)
JWT_SECRET=generate-with-openssl-rand-base64-32

# Set reasonable expiry
JWT_EXPIRES_IN=7d  # 7 days
```

### 3. **Smart Wallet Support (EIP-1271)**

Backend otomatis detect smart wallet signatures:

```typescript
// Long signatures = Smart Wallet
if (signature.length > 1000) {
  // Verify using EIP-1271
  const isValid = await contract.isValidSignature(messageHash, signature);
}
```

### 4. **Auto-Create Users**

User otomatis dibuat saat pertama kali login:

```typescript
// Default role: INVESTOR
if (!user) {
  user = await prisma.user.create({
    data: { walletAddress, role: 'INVESTOR' }
  });
}
```

### 5. **Admin Registration**

Hanya admin yang bisa membuat user dengan role khusus:

```bash
POST /auth/register
Authorization: Bearer <admin-token>
{
  "walletAddress": "0x...",
  "role": "STAFF"
}
```

---

## 📊 JWT Payload Structure

```typescript
interface JwtPayload {
  sub: string;           // User ID (UUID)
  walletAddress: string; // Wallet address (lowercase)
  role: string;          // User role (ADMIN, STAFF, etc)
  iat: number;           // Issued at (timestamp)
  exp: number;           // Expires at (timestamp)
}
```

---

## 🚨 Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

**Causes:**
- No JWT token provided
- Invalid or expired token
- User not found or deleted

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN",
  "error": "Forbidden"
}
```

**Causes:**
- User tidak memiliki role yang diperlukan
- Wallet ownership verification failed

---

## 🔄 Token Refresh

```bash
POST /auth/refresh
Authorization: Bearer <old-token>

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📝 Controller Authorization Checklist

### ✅ Semua Controller Harus:

1. **Import decorators:**
   ```typescript
   import { ApiBearerAuth } from '@nestjs/swagger';
   import { Roles } from '../auth/decorators/roles.decorator';
   import { Public } from '../auth/decorators/public.decorator';
   import { CurrentUser } from '../auth/decorators/current-user.decorator';
   import { ROLES } from '@prisma/client';
   ```

2. **Add @ApiBearerAuth() di controller level:**
   ```typescript
   @ApiBearerAuth('JWT-auth')
   @Controller('resource')
   ```

3. **Tentukan access level untuk setiap endpoint:**

   **Public endpoints:**
   ```typescript
   @Public()
   @Get()
   ```

   **Authenticated only (all roles):**
   ```typescript
   @Get('my-data')
   getMyData(@CurrentUser('sub') userId: string) {}
   ```

   **Role-restricted:**
   ```typescript
   @Roles(ROLES.ADMIN, ROLES.STAFF)
   @Post()
   create() {}
   ```

4. **Add Swagger responses:**
   ```typescript
   @ApiResponse({
     status: HttpStatus.FORBIDDEN,
     description: 'Insufficient permissions',
   })
   ```

---

## 🎯 Module Access Matrix

| Module | Public GET | Authenticated GET | Create | Update | Delete |
|--------|------------|-------------------|--------|--------|--------|
| **Auth** | ✅ nonce, verify | ✅ profile, refresh | ❌ | ❌ | ❌ |
| **Users** | ❌ | Admin/Staff | Admin | Admin | Admin |
| **Collectors** | ❌ | All Authenticated | Admin/Staff | Admin/Staff | Admin |
| **Farmers** | ❌ | All Authenticated | Collector/Staff/Admin | Staff/Admin | Admin |
| **Lands** | ❌ | All Authenticated | Collector/Staff/Admin | Staff/Admin | Admin |
| **Projects** | ✅ All | ✅ All | Collector/Staff/Admin | Staff/Admin | Admin |
| **Buyers** | ❌ | Staff/Admin | Staff/Admin | Staff/Admin | Admin |
| **Investments** | ❌ | Owner/Admin | Investor | ❌ | ❌ |
| **Portfolios** | ❌ | Owner/Admin | Auto | Auto | ❌ |
| **Profits** | ❌ | All Authenticated | Admin (deposit) | ❌ | ❌ |
| **Farmer Submissions** | ❌ | All Authenticated | Collector | Admin (approve) | Admin |
| **Project Submissions** | ❌ | All Authenticated | Staff/Admin | Admin (approve) | Admin |
| **Refunds** | ❌ | All Authenticated | Admin (mark) | ❌ | ❌ |

---

## 🧩 Frontend Integration Example

### React/Next.js with ethers.js

```typescript
// 1. Connect Wallet
import { BrowserProvider } from 'ethers';

const connectWallet = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();
  return { signer, walletAddress };
};

// 2. Login
const login = async () => {
  const { signer, walletAddress } = await connectWallet();

  // Create message with timestamp
  const message = `Login StoMaTrade: ${new Date().toISOString()}`;

  // Sign message
  const signature = await signer.signMessage(message);

  // Send to backend
  const response = await fetch('http://localhost:3000/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, message, signature })
  });

  const { accessToken, user } = await response.json();

  // Store token
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));

  return { accessToken, user };
};

// 3. Make Authenticated Requests
const getMyInvestments = async () => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/investments/my-investments', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// 4. Handle 401 Errors
const handleUnauthorized = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

---

## 🐛 Troubleshooting

### Problem: "Authentication required" meskipun sudah login

**Solutions:**
1. Check token tidak expired (JWT_EXPIRES_IN)
2. Pastikan token disimpan dengan benar
3. Verify header: `Authorization: Bearer <token>` (ada spasi setelah "Bearer")

### Problem: "Invalid signature"

**Solutions:**
1. Pastikan message format benar: `Login StoMaTrade: <ISO timestamp>`
2. Check signature tidak lebih dari 60 detik
3. Verify wallet address match dengan signature

### Problem: "Access denied" untuk endpoint tertentu

**Solutions:**
1. Check role user dengan `GET /auth/profile`
2. Verify endpoint memerlukan role yang sesuai
3. Pastikan tidak ada typo di decorator `@Roles()`

---

## 📚 Related Files

```
src/
├── modules/auth/
│   ├── auth.module.ts                    # Auth module configuration
│   ├── auth.service.ts                   # Authentication logic
│   ├── auth.controller.ts                # Auth endpoints
│   ├── strategies/
│   │   └── jwt.strategy.ts               # JWT validation strategy
│   ├── guards/
│   │   ├── jwt-auth.guard.ts             # JWT verification guard
│   │   ├── roles.guard.ts                # Role verification guard
│   │   └── wallet-auth.guard.ts          # Wallet ownership guard
│   └── decorators/
│       ├── public.decorator.ts           # @Public() decorator
│       ├── roles.decorator.ts            # @Roles() decorator
│       └── current-user.decorator.ts     # @CurrentUser() decorator
└── app.module.ts                         # Global guards configuration
```

---

## 📖 Further Reading

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [EIP-1271: Standard Signature Validation for Contracts](https://eips.ethereum.org/EIPS/eip-1271)
- [Ethers.js Signing](https://docs.ethers.org/v6/api/providers/#Signer)

---

**Last Updated:** November 2025
**Version:** 1.2.0
